import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(["CREDIT", "DEBIT"]),
  description: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, amount, type, description } = parsed.data;
  const adminId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, walletBalance: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (type === "DEBIT" && Number(user.walletBalance) < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: type === "CREDIT"
          ? { increment: amount }
          : { decrement: amount },
      },
    }),
    prisma.walletTransaction.create({
      data: {
        userId,
        type: type as "CREDIT" | "DEBIT",
        amount,
        description: `[Admin ${type === "CREDIT" ? "credit" : "debit"}] ${description}`,
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId,
        action: `WALLET_${type}`,
        targetType: "User",
        targetId: userId,
        metadata: { amount, description },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    newBalance: Number(updated.walletBalance),
  });
}
