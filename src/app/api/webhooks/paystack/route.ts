import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, type PaystackWebhookEvent } from "@/lib/paystack";
import { sendSMS, SMS_TEMPLATES } from "@/lib/arkesel";
import { sendAdminNotification, orderNotificationHtml } from "@/lib/email";
import { redis } from "@/lib/redis";

// Configuration for webhook idempotency
const WEBHOOK_IDEMPOTENCY_TTL_SECONDS = 86400; // 24 hours TTL for processed events
const WEBHOOK_IDEMPOTENCY_PREFIX = "paystack_webhook";

// In-memory fallback for webhook idempotency (per-instance only)
const processedEvents = new Set<string>();

/**
 * Check if webhook event has already been processed using Redis
 * Falls back to in-memory Set if Redis is not configured
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  // Try Redis first if available
  if (redis) {
    try {
      const key = `${WEBHOOK_IDEMPOTENCY_PREFIX}:${eventId}`;
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.warn("[webhook/paystack] Redis check failed, falling back to in-memory:", error);
    }
  }

  // Fallback to in-memory Set (per-instance only)
  return processedEvents.has(eventId);
}

/**
 * Mark webhook event as processed using Redis
 * Falls back to in-memory Set if Redis is not configured
 */
async function markEventAsProcessed(eventId: string): Promise<void> {
  // Try Redis first if available
  if (redis) {
    try {
      const key = `${WEBHOOK_IDEMPOTENCY_PREFIX}:${eventId}`;
      await redis.set(key, "1", { ex: WEBHOOK_IDEMPOTENCY_TTL_SECONDS });
    } catch (error) {
      console.warn("[webhook/paystack] Redis set failed, falling back to in-memory:", error);
    }
  }

  // Fallback to in-memory Set (per-instance only)
  processedEvents.add(eventId);
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const rawBody = await request.text();
  
  // Extract event ID from raw body for idempotency check
  let eventId: string | null = null;
  try {
    const parsed = JSON.parse(rawBody) as { id?: number; data?: { reference?: string } };
    eventId = parsed.data?.reference ?? String(parsed.id ?? "");
  } catch {
    // Will be caught below
  }

  // Idempotency check - prevent processing same event twice
  if (eventId && await isEventProcessed(eventId)) {
    console.log(`[webhook/paystack] Duplicate event ${eventId}, skipping`);
    return NextResponse.json({ received: true, status: "duplicate" });
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Store event ID for idempotency (persistent across restarts if Redis is configured)
  if (event.data?.reference) {
    await markEventAsProcessed(event.data.reference);
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const { reference } = event.data;

  // ── Wallet deposit branch (reference prefix "dep_") ──────────────────────
  if (reference.startsWith("dep_")) {
    // Use transaction to prevent race conditions during deposit processing
    await prisma.$transaction(async (tx) => {
      const txn = await tx.walletTransaction.findFirst({
        where: { orderId: reference, type: "DEBIT" },
        select: { id: true },
      });
      
      // Idempotency: skip if already credited
      if (!txn) {
        // Find the pending CREDIT marker we stored when the deposit was initiated
        const pending = await tx.walletTransaction.findFirst({
          where: { orderId: reference },
          select: { userId: true, amount: true },
        });
        
        if (pending) {
          // Update user wallet
          const [, user] = await Promise.all([
            tx.user.update({
              where: { id: pending.userId },
              data: { walletBalance: { increment: pending.amount } },
            }),
            tx.user.findUnique({ where: { id: pending.userId }, select: { phone: true } }),
          ]);
          
          await tx.walletTransaction.updateMany({
            where: { orderId: reference },
            data: { type: "CREDIT", description: `Wallet top-up — ref ${reference}` },
          });
          
          const phone = (user as { phone?: string } | null)?.phone;
          if (phone) {
            await sendSMS(phone, SMS_TEMPLATES.orderDelivered("wallet top-up", "CREDIT")).catch(() => null);
          }
        }
      }
    });
    return NextResponse.json({ received: true });
  }

  // ── Data order branch ─────────────────────────────────────────────────────
  const order = await prisma.order.findUnique({
    where: { reference },
    select: {
      id: true, reference: true, status: true, network: true,
      bundleId: true, bundleSize: true, recipientPhone: true,
      costPrice: true, sellPrice: true, userId: true,
      user: { select: { referredById: true } },
    },
  });
  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ received: true });
  }

  // Payment confirmed via Paystack — move to PENDING_FULFILLMENT.
  // Admin will manually purchase from DataMart and mark as delivered.
  await prisma.order.update({
    where: { reference },
    data: { status: "PENDING_FULFILLMENT", paymentRef: reference },
  });

  // Notify admin of confirmed payment
  sendAdminNotification(
    `Payment Confirmed — ${reference}`,
    orderNotificationHtml({
      reference,
      network: order.network,
      bundleSize: order.bundleSize,
      bundleValidity: "N/A",
      recipientPhone: order.recipientPhone,
      sellPrice: Number(order.sellPrice),
      paymentMethod: "MOMO",
      status: "PENDING_FULFILLMENT",
    }),
  );

  await sendSMS(
    order.recipientPhone,
    `Payment confirmed for order ${reference}. Your data bundle will be processed shortly.`
  );

  return NextResponse.json({ received: true });
}
