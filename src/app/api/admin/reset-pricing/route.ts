import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.pricingConfig.deleteMany({ where: { isResellerTier: false } });

  return NextResponse.json({ ok: true, message: "Retail pricing config cleared. Prices now use static bundle rates." });
}
