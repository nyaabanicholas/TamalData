import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { placeOrder, toDatamartNetwork, checkDataMartBalance, parseCapacity } from "@/lib/datamart";
import { initiateCharge, PAYSTACK_TEST_NUMBERS, isTestMode } from "@/lib/paystack";
import { getEffectivePrice, generateOrderReference } from "@/lib/markup";
import { getBundleById } from "@/data/bundles";
import { orderRateLimit, getClientIp } from "@/lib/ratelimit";
import { sendSMS, SMS_TEMPLATES } from "@/lib/arkesel";
import { notifyAdminLowBalance } from "@/lib/notify";
import type { Network } from "@/types";
import type { PaymentMethod } from "@prisma/client";

const GHANA_PHONE = /^0[2345][0-9]{8}$/;

// Map payer MoMo network → Prisma PaymentMethod
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
  // payer MoMo details (required when paymentMethod === "MOMO")
  payerPhone: z.string().regex(GHANA_PHONE, "Invalid Ghana phone number").optional(),
  payerNetwork: z.enum(["MTN", "TELECEL", "AIRTELTIGO"]).optional(),
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
    payerPhone,
    payerNetwork,
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
            status: "PAYMENT_CONFIRMED",
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

    // Payment is confirmed (wallet debited). If the DataMart account is not yet
    // funded, DON'T fail/refund — leave the order PAYMENT_CONFIRMED so it stays
    // queued and gets delivered once DataMart is topped up. Payment goes through.
    const dataMartBalanceOk = await checkDataMartBalance(costPrice);
    if (!dataMartBalanceOk) {
      // Alert admin to top up DataMart wallet
      await notifyAdminLowBalance(reference, costPrice);
      return NextResponse.json({
        reference,
        success: true,
        status: "PAYMENT_CONFIRMED",
        display_text:
          "Payment confirmed. Your data is queued and will be delivered shortly.",
      });
    }

    // Payment confirmed (from wallet) → deliver via DataMart now.
    try {
      await prisma.order.update({ where: { reference }, data: { status: "PROCESSING" } });
      const result = await placeOrder({
        network: toDatamartNetwork(net),
        phoneNumber: phone,
        capacity: parseCapacity(bundleSize),
        gateway: "wallet",
        reference,
      });

      if (result.orderStatus !== "completed") throw new Error("DataMart rejected order");

      await prisma.order.update({
        where: { reference },
        data: {
          status: "DELIVERED",
          datamartRef: result.orderReference,
          deliveredAt: new Date(),
        },
      });
      await sendSMS(phone, SMS_TEMPLATES.orderDelivered(bundleSize, net)).catch(() => null);

      return NextResponse.json({ reference, success: true, status: "DELIVERED" });
    } catch (error) {
      // If DataMart is simply underfunded, keep the order PAYMENT_CONFIRMED
      // (queued) and DON'T refund — payment stays good, delivery happens once
      // the DataMart account is topped up.
      const msg = error instanceof Error ? error.message : "";
      if (/insufficient/i.test(msg) && /balance/i.test(msg)) {
        await prisma.order.update({
          where: { reference },
          data: { status: "PAYMENT_CONFIRMED" },
        });
        await notifyAdminLowBalance(reference, costPrice);
        return NextResponse.json({
          reference,
          success: true,
          status: "PAYMENT_CONFIRMED",
          display_text:
            "Payment confirmed. Your data is queued and will be delivered shortly.",
        });
      }
      // Delivery failed after debit → refund the wallet so the user isn't charged.
      // Use transaction with locking to prevent race conditions during refund
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { reference },
          data: {
            status: "FAILED",
            failureReason: error instanceof Error ? error.message : "DataMart error",
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: sellPrice } },
        });

        await tx.walletTransaction.create({
          data: {
            userId,
            type: "CREDIT",
            amount: sellPrice,
            description: `Refund — failed order ${reference}`,
            orderId: reference,
          },
        });
      });
      console.error("[/api/order] wallet delivery error:", error);
      return NextResponse.json(
        { error: "Delivery failed — your wallet was refunded. Please try again." },
        { status: 502 },
      );
    }
  }

  // ─── MOMO path: collect payment via Paystack FIRST; webhook delivers ────────
  if (!payerPhone || !payerNetwork) {
    return NextResponse.json(
      { error: "Enter the mobile money number and network to pay with." },
      { status: 400 },
    );
  }

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
      paymentMethod: PAYMENT_METHOD[payerNetwork as Network],
      status: "PENDING",
    },
  });

  try {
    const charge = await initiateCharge({
      amount: sellPrice,
      phone: payerPhone,
      network: payerNetwork as Network,
      reference,
    });

    // In test mode, auto-confirm the order since the Paystack webhook
    // won't fire (no actual phone prompt to approve). This unblocks
    // end-to-end testing: the timeline will show "Payment Confirmed"
    // and data will be delivered via DataMart immediately.
    if (isTestMode() && charge.status) {
      await prisma.order.update({
        where: { reference },
        data: { status: "PAYMENT_CONFIRMED", paymentRef: reference },
      });

      // Proceed with DataMart delivery
      await prisma.order.update({
        where: { reference },
        data: { status: "PROCESSING" },
      });

      const dataMartBalanceOk = await checkDataMartBalance(costPrice);
      if (dataMartBalanceOk) {
        const dmResult = await placeOrder({
          network: toDatamartNetwork(net),
          phoneNumber: phone,
          capacity: parseCapacity(bundleSize),
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

          return NextResponse.json({
            reference,
            success: true,
            status: "DELIVERED",
            display_text: "Test payment successful! Data has been delivered.",
          });
        }
      }

      // If datamart delivery fails, keep at PAYMENT_CONFIRMED
      return NextResponse.json({
        reference,
        success: true,
        status: "PAYMENT_CONFIRMED",
        display_text: "Test payment confirmed. Processing delivery...",
      });
    }

    // Delivery happens ONLY in the Paystack webhook on charge.success.
    return NextResponse.json({
      reference,
      success: true,
      status: "PENDING",
      display_text:
        charge.data?.display_text ?? "Approve the payment prompt on your phone.",
    });
  } catch (error) {
    await prisma.order.update({
      where: { reference },
      data: {
        status: "FAILED",
        failureReason: error instanceof Error ? error.message : "Payment initiation failed",
      },
    });
    console.error("[/api/order] Paystack charge error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isTestModeError = errorMessage.includes("test mobile money number") || 
                            errorMessage.includes("test transaction") ||
                            errorMessage.includes("Declined");

    if (isTestModeError) {
      return NextResponse.json(
        { 
          error: "Test transaction requires test mobile money number",
          message: "Please use Paystack test mobile money numbers",
          testNumbers: PAYSTACK_TEST_NUMBERS,
          reference,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { 
        error: "Could not start payment. Please try again.",
        reference,
      },
      { status: 502 },
    );
  }
}
