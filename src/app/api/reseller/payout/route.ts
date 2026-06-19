import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const minPayout = Number(settings?.minPayoutAmount ?? 20);

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } });
  const balance = Number(user?.walletBalance ?? 0);

  if (parsed.data.amount < minPayout) return NextResponse.json({ error: `Minimum payout is GH₵${minPayout}` }, { status: 400 });
  if (parsed.data.amount > balance)   return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  const existing = await prisma.payoutRequest.findFirst({ where: { userId: session.user.id, status: "PENDING" } });
  if (existing) return NextResponse.json({ error: "You already have a pending payout request" }, { status: 409 });

  const payout = await prisma.payoutRequest.create({
    data: { userId: session.user.id, ...parsed.data, status: "PENDING" },
  });

  return NextResponse.json(payout, { status: 201 });
}
