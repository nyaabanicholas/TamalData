import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createTransferRecipient, getRecipientCode, createTransfer, isTestMode } from "@/lib/paystack";
import { generateOrderReference } from "@/lib/markup";
import type { Network } from "@/types";

const schema = z.object({
  amount:      z.number().min(1),
  momoPhone:   z.string().regex(/^0[2345]\d{8}$/),
  momoNetwork: z.enum(["MTN", "TELECEL", "AIRTELTIGO"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payouts = await prisma.payoutRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payouts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only approved resellers can withdraw
  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { walletBalance: true, role: true, resellerStatus: true, name: true },
  });
  if (!userRecord || userRecord.role !== "RESELLER" || userRecord.resellerStatus !== "APPROVED") {
    return NextResponse.json({ error: "Only approved resellers can withdraw." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const minPayout = Number(settings?.minPayoutAmount ?? 20);
  const balance = Number(userRecord.walletBalance);
  const { amount, momoPhone, momoNetwork } = parsed.data;

  if (amount < minPayout) return NextResponse.json({ error: `Minimum withdrawal is GH₵${minPayout}` }, { status: 400 });
  if (amount > balance) return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });

  // One active payout at a time
  const existing = await prisma.payoutRequest.findFirst({
    where: { userId: session.user.id, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existing) return NextResponse.json({ error: "You already have a pending payout request" }, { status: 409 });

  // Atomically deduct wallet + create payout record (APPROVED = wallet reserved, transfer pending)
  let payout: { id: string };
  try {
    payout = await prisma.$transaction(async (tx) => {
      const fresh = await tx.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } });
      if (Number(fresh?.walletBalance ?? 0) < amount) throw new Error("INSUFFICIENT_FUNDS");

      await tx.user.update({ where: { id: session.user.id }, data: { walletBalance: { decrement: amount } } });

      const created = await tx.payoutRequest.create({
        data: { userId: session.user.id, amount, momoPhone, momoNetwork: momoNetwork as Network, status: "APPROVED" },
      });

      await tx.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: "PAYOUT",
          amount,
          description: `Withdrawal to ${momoNetwork} ${momoPhone}`,
          orderId: created.id,
        },
      });

      return created;
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "INSUFFICIENT_FUNDS") return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    console.error("[payout] wallet debit error:", err);
    return NextResponse.json({ error: "Could not process withdrawal" }, { status: 500 });
  }

  // Test mode: skip real Paystack transfer
  if (isTestMode()) {
    const updated = await prisma.payoutRequest.update({
      where: { id: payout.id },
      data: { status: "PAID", processedAt: new Date(), adminNote: "Test mode — transfer skipped" },
    });
    return NextResponse.json(updated, { status: 201 });
  }

  // Live mode: create Paystack transfer recipient → initiate transfer
  try {
    let recipientCode = await getRecipientCode(momoPhone, momoNetwork as Network);
    if (!recipientCode) {
      const recipientResp = await createTransferRecipient({
        name: userRecord.name || "Reseller",
        phone: momoPhone,
        network: momoNetwork as Network,
      });
      recipientCode = recipientResp.data.recipient_code;
    }

    const transferReference = generateOrderReference();
    const transferResp = await createTransfer({
      amount,
      recipient: recipientCode,
      reference: transferReference,
      reason: `TamalData payout — ${momoPhone}`,
    });

    if (!transferResp.status) throw new Error(transferResp.message ?? "Transfer failed");

    const updated = await prisma.payoutRequest.update({
      where: { id: payout.id },
      data: {
        status: "PAID",
        processedAt: new Date(),
        paystackTransferRef: transferResp.data?.reference ?? transferReference,
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    // Refund wallet — transfer failed, don't charge the reseller
    await prisma.$transaction([
      prisma.user.update({ where: { id: session.user.id }, data: { walletBalance: { increment: amount } } }),
      prisma.payoutRequest.update({
        where: { id: payout.id },
        data: {
          status: "REJECTED",
          adminNote: error instanceof Error ? error.message : "Paystack transfer failed",
          processedAt: new Date(),
        },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: "CREDIT",
          amount,
          description: `Withdrawal refund — transfer failed`,
          orderId: payout.id,
        },
      }),
    ]);

    console.error("[payout] Paystack transfer error:", error);
    return NextResponse.json(
      { error: "Payout failed — your wallet has been refunded. Please try again." },
      { status: 502 },
    );
  }
}
