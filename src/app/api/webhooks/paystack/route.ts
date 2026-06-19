import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, type PaystackWebhookEvent } from "@/lib/paystack";
import { placeOrder, toDatamartNetwork, checkDataMartBalance, parseCapacity } from "@/lib/datamart";
import type { Network } from "@/types";
import { sendSMS, SMS_TEMPLATES } from "@/lib/arkesel";
import { notifyAdminLowBalance } from "@/lib/notify";
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

  // Check DataMart wallet balance before placing order
  const dataMartBalanceOk = await checkDataMartBalance(Number(order.costPrice));
  if (!dataMartBalanceOk) {
    console.error(`[webhook/paystack] DataMart balance insufficient for order ${reference}`);
    // Keep order at PAYMENT_CONFIRMED so it can be retried once wallet is topped up
    await prisma.order.update({
      where: { reference },
      data: { status: "PAYMENT_CONFIRMED", paymentRef: reference },
    });
    // Alert admin to top up DataMart wallet
    await notifyAdminLowBalance(reference, Number(order.costPrice));
    await sendSMS(
      order.recipientPhone,
      `Payment confirmed for order ${reference}. Your data bundle will be delivered shortly. Thank you for your patience.`
    );
    return NextResponse.json({ received: true });
  }

  // Mark payment confirmed
  await prisma.order.update({
    where: { reference },
    data: { status: "PAYMENT_CONFIRMED", paymentRef: reference },
  });

  // Place data order with DataMart
  try {
    await prisma.order.update({
      where: { reference },
      data: { status: "PROCESSING" },
    });

    const dmResult = await placeOrder({
      network: toDatamartNetwork(order.network as Network),
      phoneNumber: order.recipientPhone,
      capacity: parseCapacity(order.bundleSize),
      gateway: "wallet",
      reference,
    });

    if (dmResult.orderStatus === "completed") {
      await prisma.order.update({
        where: { reference },
        data: {
          status: "DELIVERED",
          datamartRef: dmResult.orderReference,
          deliveredAt: new Date(),
        },
      });

      await sendSMS(
        order.recipientPhone,
        SMS_TEMPLATES.orderDelivered(order.bundleSize, order.network)
      );

      // ── Referral commission (5% of sell price to referrer) ───────────────
      if (order.userId && order.user?.referredById) {
        const commissionAmount = Number(order.sellPrice) * 0.05;
        await prisma.$transaction([
          prisma.user.update({
            where: { id: order.user.referredById },
            data: { walletBalance: { increment: commissionAmount } },
          }),
          prisma.walletTransaction.create({
            data: {
              userId: order.user.referredById,
              type: "COMMISSION",
              amount: commissionAmount,
              description: `Referral commission — order ${reference}`,
              orderId: reference,
            },
          }),
        ]);
      }
    } else {
      throw new Error("DataMart order failed — status: " + dmResult.orderStatus);
    }
  } catch (error) {
    console.error("[webhook/paystack] DataMart order error:", error);

    await prisma.order.update({
      where: { reference },
      data: {
        status: "FAILED",
        failureReason: error instanceof Error ? error.message : "DataMart error",
      },
    });

    await sendSMS(order.recipientPhone, SMS_TEMPLATES.orderFailed(reference));
  }

  return NextResponse.json({ received: true });
}
