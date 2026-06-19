import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createTransferRecipient, getRecipientCode, createTransfer, isTestMode } from "@/lib/paystack";
import { generateOrderReference } from "@/lib/markup";
import type { Network } from "@/types";

const schema = z.object({
  action: z.enum(["APPROVE", "REJECT", "PAY"]),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { action, adminNote } = parsed.data;
  const adminId = session.user.id;

  const payout = await prisma.payoutRequest.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, amount: true, status: true },
  });
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "REJECT") {
    const updated = await prisma.payoutRequest.update({
      where: { id: params.id },
      data: { status: "REJECTED", adminNote, processedAt: new Date(), processedBy: adminId },
    });
    return NextResponse.json(updated);
  }

  if (action === "APPROVE") {
    if (payout.status !== "PENDING") {
      return NextResponse.json({ error: "Only PENDING requests can be approved" }, { status: 400 });
    }
    const updated = await prisma.payoutRequest.update({
      where: { id: params.id },
      data: { status: "APPROVED", adminNote, processedAt: new Date(), processedBy: adminId },
    });
    return NextResponse.json(updated);
  }

  // PAY: deduct wallet + initiate MoMo transfer + mark PAID + write PAYOUT txn
  if (payout.status !== "APPROVED") {
    return NextResponse.json({ error: "Only APPROVED requests can be paid" }, { status: 400 });
  }

  // Get full payout details including MoMo info
  const fullPayout = await prisma.payoutRequest.findUnique({
    where: { id: params.id },
    select: { userId: true, amount: true, momoPhone: true, momoNetwork: true, status: true },
  });
  
  if (!fullPayout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payout.userId },
    select: { walletBalance: true, name: true },
  });
  if (!user || Number(user.walletBalance) < Number(payout.amount)) {
    return NextResponse.json({ error: "Insufficient wallet balance to process payout" }, { status: 402 });
  }

  const transferReference = generateOrderReference();
  const amount = Number(fullPayout.amount);
  const momoPhone = fullPayout.momoPhone;
  const momoNetwork = fullPayout.momoNetwork as Network;
  const userName = user.name || "Reseller";

  try {
    // For test mode, skip actual MoMo transfer but still deduct wallet
    if (isTestMode()) {
      console.log(`[payout] Test mode: Skipping actual MoMo transfer for ${momoPhone}`);
      const [updated] = await prisma.$transaction([
        prisma.payoutRequest.update({
          where: { id: params.id },
          data: { 
            status: "PAID", 
            adminNote: adminNote || "Test mode - transfer not sent",
            processedAt: new Date(), 
            processedBy: adminId 
          },
        }),
        prisma.user.update({
          where: { id: payout.userId },
          data: { walletBalance: { decrement: payout.amount } },
        }),
        prisma.walletTransaction.create({
          data: {
            userId: payout.userId,
            type: "PAYOUT",
            amount: payout.amount,
            description: `Payout processed — request ${params.id} (Test mode)`,
            orderId: params.id,
          },
        }),
      ]);
      return NextResponse.json(updated);
    }

    // For live mode, create recipient and initiate transfer
    let recipientCode = await getRecipientCode(momoPhone, momoNetwork);
    
    if (!recipientCode) {
      // Create new recipient
      const recipientResponse = await createTransferRecipient({
        name: userName,
        phone: momoPhone,
        network: momoNetwork,
      });
      recipientCode = recipientResponse.data.recipient_code;
    }

    // Initiate the transfer
    const transferResponse = await createTransfer({
      amount,
      recipient: recipientCode,
      reference: transferReference,
      reason: `Reseller payout - ${userName}`,
    });

    if (!transferResponse.status) {
      return NextResponse.json(
        { error: `Paystack transfer failed: ${transferResponse.message}` },
        { status: 502 }
      );
    }

    // Mark as PAID and record the transfer reference
    const [updated] = await prisma.$transaction([
      prisma.payoutRequest.update({
        where: { id: params.id },
        data: { 
          status: "PAID", 
          adminNote: adminNote || `Transfer ref: ${transferResponse.data.reference}`,
          processedAt: new Date(), 
          processedBy: adminId,
          // Store Paystack transfer reference
          ...(transferResponse.data.reference && { paystackTransferRef: transferResponse.data.reference }),
        },
      }),
      prisma.user.update({
        where: { id: payout.userId },
        data: { walletBalance: { decrement: payout.amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: payout.userId,
          type: "PAYOUT",
          amount: payout.amount,
          description: `Payout processed — request ${params.id} (Transfer: ${transferResponse.data.reference})`,
          orderId: params.id,
        },
      }),
    ]);

    return NextResponse.json({
      ...updated,
      transferReference: transferResponse.data.reference,
    });
  } catch (error) {
    console.error("[payout] Transfer error:", error);
    return NextResponse.json(
      { error: `Failed to process payout: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
