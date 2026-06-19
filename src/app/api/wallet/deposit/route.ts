import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateCharge, isTestMode } from "@/lib/paystack";
import { z } from "zod";
import type { Network } from "@/types";

const GHANA_PHONE = /^0[2345][0-9]{8}$/;

const DepositSchema = z.object({
  amount: z.number().min(1, "Minimum deposit is GH₵1"),
  phone: z.string().regex(GHANA_PHONE, "Invalid Ghana phone number"),
  network: z.enum(["MTN", "TELECEL", "AIRTELTIGO"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in to deposit." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = DepositSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { amount, phone, network } = parsed.data;
  const userId = session.user.id;
  const reference = `dep_${crypto.randomUUID().replace(/-/g, "")}`;

  // ── Test mode: skip Paystack, credit wallet directly ─────────────────
  if (isTestMode()) {
    console.log(`[/api/wallet/deposit] Test mode: crediting wallet with GH₵${amount}`);

    await prisma.$transaction(async (tx) => {
      // Credit the user's wallet
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      });

      // Create a completed transaction record
      await tx.walletTransaction.create({
        data: {
          userId,
          type: "CREDIT",
          amount,
          description: `Wallet top-up — ref ${reference} (Test mode)`,
          orderId: reference,
        },
      });
    });

    return NextResponse.json({
      reference,
      status: "completed",
      amount,
      display_text: "Test deposit complete! Your wallet has been credited.",
    });
  }

  // ── Live mode: use Paystack charge ────────────────────────────────────
  // Write a pending marker so webhook can find the user + amount
  await prisma.walletTransaction.create({
    data: {
      userId,
      type: "DEBIT", // placeholder; webhook will update to CREDIT on success
      amount,
      description: `Wallet deposit pending — ref ${reference}`,
      orderId: reference,
    },
  });

  try {
    const charge = await initiateCharge({
      amount,
      phone,
      network: network as Network,
      reference,
    });

    // Check if Paystack returned a failed status (HTTP 200 but status: false)
    if (!charge.status) {
      await prisma.walletTransaction.deleteMany({ where: { orderId: reference } });
      console.error("[/api/wallet/deposit] Paystack declined charge:", charge.message);
      return NextResponse.json({
        error: charge.message || "Payment was declined. Try a different number.",
        paystackMessage: charge.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      reference,
      display_text: charge.data?.display_text ?? "Approve the payment prompt on your phone.",
    });
  } catch (error) {
    // Clean up pending marker if Paystack call fails
    await prisma.walletTransaction.deleteMany({ where: { orderId: reference } });
    const errorMessage = error instanceof Error ? error.message : "Unknown Paystack error";
    console.error("[/api/wallet/deposit] Paystack error:", errorMessage);
    return NextResponse.json({ error: `Payment failed: ${errorMessage}` }, { status: 502 });
  }
}
