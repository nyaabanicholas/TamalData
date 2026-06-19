import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { bulkPurchase, toDatamartNetwork, checkDataMartBalance, parseCapacity } from "@/lib/datamart";
import { getEffectivePrice, generateOrderReference } from "@/lib/markup";
import { getBundleById } from "@/data/bundles";
import { orderRateLimit, getClientIp } from "@/lib/ratelimit";
import type { Network } from "@/types";

const RecipientSchema = z.object({
  phone: z.string().regex(/^0[2345][0-9]{8}$/, "Invalid Ghana phone number"),
  bundleId: z.string().min(1),
  bundleSize: z.string().min(1),
  bundleValidity: z.string().min(1),
  costPrice: z.number().positive(),
});

const BulkOrderSchema = z.object({
  network: z.enum(["MTN", "TELECEL", "AIRTELTIGO"]),
  recipients: z.array(RecipientSchema).min(1).max(50),
  userId: z.string().optional(),
  agentId: z.string().optional(), // Reseller ID for customer tracking
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (orderRateLimit) {
    const { success: allowed } = await orderRateLimit.limit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes." },
        { status: 429 }
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = BulkOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { network, recipients, userId, agentId } = parsed.data;
  const batchReference = generateOrderReference();

  // Bulk orders are paid from the reseller's funded wallet (wallet balance ==
  // money already collected), so delivery here never precedes payment.
  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to place a bulk order from your wallet." },
      { status: 401 },
    );
  }

  // Use userId as agentId if not provided (for reseller bulk orders)
  const effectiveAgentId = agentId || userId;

  // Price every recipient first to compute the total to debit.
  const priced = await Promise.all(
    recipients.map(async (r) => {
      const def = getBundleById(r.bundleId, network as Network);
      const { sellPrice } = await getEffectivePrice(
        network as Network,
        r.bundleId,
        r.costPrice,
        def?.recommendedPrice ?? r.costPrice,
      );
      return { ...r, sellPrice, ref: generateOrderReference() };
    }),
  );
  const total = priced.reduce((sum, p) => sum + p.sellPrice, 0);

  // Check DataMart balance for total amount before debiting wallet
  const totalCostPrice = priced.reduce((sum, p) => sum + p.costPrice, 0);
  const dataMartBalanceOk = await checkDataMartBalance(totalCostPrice);
  if (!dataMartBalanceOk) {
    return NextResponse.json(
      { error: "Insufficient DataMart wallet balance for bulk order. Please try again later." },
      { status: 503 },
    );
  }

  // Atomically debit the wallet, log the txn, and create all order rows.
  let orderRows: { ref: string; phone: string; bundleId: string }[];
  try {
    orderRows = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      });
      if (!user) throw new Error("ACCOUNT_NOT_FOUND");
      if (Number(user.walletBalance) < total) throw new Error("INSUFFICIENT_FUNDS");

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: total } },
      });
      await tx.walletTransaction.create({
        data: {
          userId,
          type: "DEBIT",
          amount: total,
          description: `Bulk order — ${recipients.length} × ${network}`,
          orderId: batchReference,
        },
      });

      const rows: { ref: string; phone: string; bundleId: string }[] = [];
      for (const p of priced) {
        // Create or update customer for reseller tracking (bulk orders)
        let customerId: string | undefined;
        if (effectiveAgentId) {
          const existingCustomer = await tx.customer.findFirst({
            where: { agentId: effectiveAgentId, phone: p.phone },
            select: { id: true },
          });
          
          if (existingCustomer) {
            customerId = existingCustomer.id;
            await tx.customer.update({
              where: { id: customerId },
              data: {
                totalOrders: { increment: 1 },
                totalSpent: { increment: p.sellPrice },
                lastOrderAt: new Date(),
                network: network as Network,
              },
            });
          } else {
            const newCustomer = await tx.customer.create({
              data: {
                agentId: effectiveAgentId,
                phone: p.phone,
                network: network as Network,
                totalOrders: 1,
                totalSpent: p.sellPrice,
                lastOrderAt: new Date(),
              },
            });
            customerId = newCustomer.id;
          }
        }

        await tx.order.create({
          data: {
            reference: p.ref,
            userId,
            agentId: effectiveAgentId,
            customerId: effectiveAgentId ? customerId : null,
            network: network as Network,
            bundleId: p.bundleId,
            bundleSize: p.bundleSize,
            bundleValidity: p.bundleValidity,
            recipientPhone: p.phone,
            costPrice: p.costPrice,
            sellPrice: p.sellPrice,
            paymentMethod: "WALLET",
            paymentRef: batchReference,
            status: "PAYMENT_CONFIRMED",
          },
        });
        rows.push({ ref: p.ref, phone: p.phone, bundleId: p.bundleId });
      }
      return rows;
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "WALLET_ERROR";
    if (code === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { error: "Insufficient wallet balance for this bulk order." },
        { status: 402 },
      );
    }
    if (code === "ACCOUNT_NOT_FOUND") {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    console.error("[/api/bulk-order] wallet debit error:", err);
    return NextResponse.json({ error: "Could not process payment." }, { status: 500 });
  }

  const refundWallet = async (reason: string) => {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: total } },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type: "CREDIT",
          amount: total,
          description: `Refund — failed bulk order ${batchReference}`,
          orderId: batchReference,
        },
      });

      for (const o of orderRows) {
        await tx.order.update({
          where: { reference: o.ref },
          data: { status: "FAILED", failureReason: reason },
        });
      }
    });
  };

  try {
    const dmNetwork = toDatamartNetwork(network as Network);
    const result = await bulkPurchase({
      orders: recipients.map((r) => ({
        phoneNumber: r.phone,
        network: dmNetwork,
        capacity: parseCapacity(r.bundleSize),
        ref: r.bundleId,
      })),
      reference: batchReference,
    });

    if (result.summary.failed > 0 || result.summary.invalid > 0) {
      await refundWallet(`Bulk order: ${result.summary.failed} failed, ${result.summary.invalid} invalid`);
      return NextResponse.json(
        { error: `Bulk order had failures — wallet refunded. ${result.summary.failed} failed, ${result.summary.invalid} invalid.` },
        { status: 502 }
      );
    }

    await Promise.all(
      orderRows.map((o) =>
        prisma.order.update({
          where: { reference: o.ref },
          data: { status: "DELIVERED", datamartRef: batchReference, deliveredAt: new Date() },
        })
      )
    );

    return NextResponse.json({
      success: true,
      batchReference,
      results: result.results ?? [],
      count: recipients.length,
    });
  } catch (error) {
    await refundWallet("DataMart API error");
    console.error("[/api/bulk-order] DataMart error:", error);
    return NextResponse.json(
      { error: "Could not complete bulk order — wallet refunded. Please try again." },
      { status: 502 }
    );
  }
}
