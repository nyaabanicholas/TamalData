import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref || !ref.startsWith("dep_")) {
    return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }

  const txn = await prisma.walletTransaction.findFirst({
    where: { orderId: ref, userId: session.user.id },
    select: { type: true, amount: true },
  });

  if (!txn) {
    return NextResponse.json({ status: "not_found" });
  }

  // Webhook updates the pending CREDIT marker — when type is CREDIT, deposit succeeded
  if (txn.type === "CREDIT") {
    return NextResponse.json({ status: "completed", amount: Number(txn.amount) });
  }

  // Still DEBIT or pending — not yet processed
  return NextResponse.json({ status: "pending" });
}
