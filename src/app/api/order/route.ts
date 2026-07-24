import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { initializeTransaction, isTestMode } from "@/lib/paystack";
import { getEffectivePrice, generateOrderReference } from "@/lib/markup";
import { getBundleById } from "@/data/bundles";
import { orderRateLimit, getClientIp } from "@/lib/ratelimit";
import { sendAdminNotification, orderNotificationHtml } from "@/lib/email";
import type { Network } from "@/types";
import type { PaymentMethod } from "@prisma/client";

const GHANA_PHONE = /^0[2345][0-9]{8}$/;

// Bundle network → Prisma PaymentMethod (informational tag only; the actual
// payer network is whatever the customer selects on Paystack's checkout page).
const PAYMENT_METHOD: Record<Network, PaymentMethod> = {
  MTN: "MTN_MOMO",
  TELECEL: "TELECEL_CASH",
  AIRTELTIGO: "AIRTELTIGO_MONEY",
};

const OrderSchema = z.object({
  network: z.enum(["MTN", "TELECEL", "AIRTELTIGO"]),
  bundleId: z.string().min(1),
  bundleSize: z.string().min(1),
  bundleValidity: z.string().min(1),
  costPrice: z.number().positive(),
  sellPrice: z.number().positive().optional(), // Custom sell price (e.g., for reseller stores)
  // recipient line that receives the data
  phone: z.string().regex(GHANA_PHONE, "Invalid Ghana phone number"),
  userId: z.string().optional(),
  agentId: z.string().optional(),
  // payment selection
  paymentMethod: z.enum(["MOMO", "WALLET"]).default("MOMO"),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (orderRateLimit) {
    const { success: allowed } = await orderRateLimit.limit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    network,
    bundleId,
    bundleSize,
    bundleValidity,
    costPrice,
    sellPrice: customSellPrice,
    phone,
    userId,
    agentId,
    paymentMethod,
  } = parsed.data;

  const net = network as Network;
  const reference = generateOrderReference();
  const def = getBundleById(bundleId, net);
  
  // Validate bundle exists
  if (!def) {
    return NextResponse.json(
      { error: "Invalid bundle ID" },
      { status: 400 }
    );
  }
  
  // Use custom sellPrice if provided (for reseller stores), otherwise calculate it
  // But validate custom price is reasonable
  let sellPrice: number;
  if (customSellPrice !== undefined) {
    // For reseller stores with custom pricing
    const calculatedPrice = (await getEffectivePrice(
      net,
      bundleId,
      costPrice,
      def?.recommendedPrice ?? costPrice,
    )).sellPrice;
    
    // Validate custom price is within reasonable bounds
    // Allow resellers to set price between cost and 2x recommended price
    const minPrice = costPrice; // Cannot sell below cost
    const maxPrice = calculatedPrice * 2; // Cannot exceed 2x standard price
    
    if (customSellPrice < minPrice || customSellPrice > maxPrice) {
      return NextResponse.json(
        { error: `Price must be between GH₵${minPrice.toFixed(2)} and GH₵${maxPrice.toFixed(2)}` },
        { status: 400 }
      );
    }
    sellPrice = customSellPrice;
  } else {
    // Calculate price normally
    sellPrice = (await getEffectivePrice(
      net,
      bundleId,
      costPrice,
      def?.recommendedPrice ?? costPrice,
    )).sellPrice;
  }

  // ─── WALLET path: deduct balance + deliver inline (funded balance == paid) ──
  if (paymentMethod === "WALLET") {
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to pay from your wallet." },
        { status: 401 },
      );
    }

    try {
      // Atomically verify + debit the wallet, create the order, log the txn.
      // Use SELECT FOR UPDATE to prevent race conditions on concurrent wallet operations
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true },
        });
        if (!user) throw new Error("ACCOUNT_NOT_FOUND");
        if (Number(user.walletBalance) < sellPrice) throw new Error("INSUFFICIENT_FUNDS");

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: sellPrice } },
        });

        // Create or update customer for reseller tracking
        let customerId: string | undefined;
        if (agentId) {
          const existingCustomer = await tx.customer.findFirst({
            where: { agentId, phone },
            select: { id: true },
          });
          
          if (existingCustomer) {
            customerId = existingCustomer.id;
            await tx.customer.update({
              where: { id: customerId },
              data: {
                totalOrders: { increment: 1 },
                totalSpent: { increment: sellPrice },
                lastOrderAt: new Date(),
                network: net,
              },
            });
          } else {
            const newCustomer = await tx.customer.create({
              data: {
                agentId,
                phone,
                network: net,
                totalOrders: 1,
                totalSpent: sellPrice,
                lastOrderAt: new Date(),
              },
            });
            customerId = newCustomer.id;
          }
        }

        await tx.order.create({
          data: {
            reference,
            userId,
            agentId: agentId ?? null,
            customerId: agentId ? customerId : null,
            network: net,
            bundleId,
            bundleSize,
            bundleValidity,
            recipientPhone: phone,
            costPrice,
            sellPrice,
            paymentMethod: "WALLET",
            paymentRef: reference,
            status: "PENDING_FULFILLMENT",
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId,
            type: "DEBIT",
            amount: sellPrice,
            description: `Data purchase — ${bundleSize} ${net}`,
            orderId: reference,
          },
        });
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : "WALLET_ERROR";
      if (code === "INSUFFICIENT_FUNDS") {
        return NextResponse.json(
          { error: "Insufficient wallet balance. Top up and try again." },
          { status: 402 },
        );
      }
      if (code === "ACCOUNT_NOT_FOUND") {
        return NextResponse.json({ error: "Account not found." }, { status: 404 });
      }
      console.error("[/api/order] wallet debit error:", err);
      return NextResponse.json({ error: "Could not process wallet payment." }, { status: 500 });
    }

    // Wallet debited, order created with status PENDING_FULFILLMENT.
    // Admin will manually purchase from DataMart and mark as delivered.
    sendAdminNotification(
      `New Wallet Order — ${reference}`,
      orderNotificationHtml({
        reference,
        network: net,
        bundleSize,
        bundleValidity,
        recipientPhone: phone,
        sellPrice,
        paymentMethod: "WALLET",
        status: "PENDING_FULFILLMENT",
      }),
    );

    return NextResponse.json({
      reference,
      success: true,
      status: "PENDING_FULFILLMENT",
      display_text: "Payment confirmed. Admin will process your data shortly.",
    });
  }

  // ─── MOMO path: redirect to Paystack's hosted checkout; webhook delivers ────
  // Payer enters their OWN number on Paystack's page — kept separate from the
  // recipient `phone` above, since the two can be different people.

  // Create or update customer for reseller tracking (MOMO path)
  let customerId: string | undefined;
  if (agentId) {
    const existingCustomer = await prisma.customer.findFirst({
      where: { agentId, phone },
      select: { id: true },
    });
    
    if (existingCustomer) {
      customerId = existingCustomer.id;
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: sellPrice },
          lastOrderAt: new Date(),
          network: net,
        },
      });
    } else {
      const newCustomer = await prisma.customer.create({
        data: {
          agentId,
          phone,
          network: net,
          totalOrders: 1,
          totalSpent: sellPrice,
          lastOrderAt: new Date(),
        },
      });
      customerId = newCustomer.id;
    }
  }

  await prisma.order.create({
    data: {
      reference,
      userId: userId ?? null,
      agentId: agentId ?? null,
      customerId: agentId ? customerId : null,
      network: net,
      bundleId,
      bundleSize,
      bundleValidity,
      recipientPhone: phone,
      costPrice,
      sellPrice,
      paymentMethod: PAYMENT_METHOD[net],
      status: "PENDING",
    },
  });

  // Notify admin of new order
  sendAdminNotification(
    `New MoMo Order — ${reference}`,
    orderNotificationHtml({
      reference,
      network: net,
      bundleSize,
      bundleValidity,
      recipientPhone: phone,
      sellPrice,
      paymentMethod: PAYMENT_METHOD[net],
      status: "PENDING",
    }),
  );

  // In test mode, auto-confirm the order since there's no live Paystack
  // checkout to complete and no webhook will fire against localhost.
  if (isTestMode()) {
    await prisma.order.update({
      where: { reference },
      data: { status: "PENDING_FULFILLMENT", paymentRef: reference },
    });

    return NextResponse.json({
      reference,
      success: true,
      status: "PENDING_FULFILLMENT",
      display_text: "Test payment successful! Admin will process the data shortly.",
    });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const init = await initializeTransaction({
      amount: sellPrice,
      email: `${phone}@tamaldata.com`,
      reference,
      callback_url: `${appUrl}/track?ref=${reference}`,
    });

    if (!init.status) {
      await prisma.order.update({
        where: { reference },
        data: { status: "FAILED", failureReason: init.message || "Could not start payment" },
      });
      return NextResponse.json(
        { error: init.message || "Could not start payment. Please try again.", reference },
        { status: 502 },
      );
    }

    // Delivery happens ONLY in the Paystack webhook on charge.success —
    // the customer now goes to Paystack's page to pick a network + number.
    return NextResponse.json({
      reference,
      success: true,
      status: "PENDING",
      authorization_url: init.data.authorization_url,
    });
  } catch (error) {
    await prisma.order.update({
      where: { reference },
      data: {
        status: "FAILED",
        failureReason: error instanceof Error ? error.message : "Payment initiation failed",
      },
    });
    console.error("[/api/order] Paystack initialize error:", error);

    return NextResponse.json(
      {
        error: "Could not start payment. Please try again.",
        reference,
      },
      { status: 502 },
    );
  }
}
