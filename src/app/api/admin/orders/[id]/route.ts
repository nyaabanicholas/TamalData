import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getAdminSession } from "@/lib/auth-helpers";

const PatchSchema = z.object({
  status: z.enum(["DELIVERED", "FAILED", "REFUNDED"]),
  failureReason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAdminSession();
  const adminId = session?.user?.id ?? "unknown";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { status, failureReason } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "FAILED") updateData.failureReason = failureReason ?? "Manually failed by admin";
  if (status === "DELIVERED") updateData.deliveredAt = new Date();

  // If refunding a wallet order, credit the user
  if (status === "REFUNDED" && order.userId && order.paymentMethod === "WALLET") {
    await prisma.$transaction([
      prisma.order.update({ where: { id: params.id }, data: updateData }),
      prisma.user.update({
        where: { id: order.userId },
        data: { walletBalance: { increment: order.sellPrice } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: order.userId,
          type: "CREDIT",
          amount: order.sellPrice,
          description: `Refund for order ${order.reference}`,
          orderId: order.id,
        },
      }),
    ]);
  } else {
    await prisma.order.update({ where: { id: params.id }, data: updateData });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId,
      action: `ORDER_${status}`,
      targetType: "Order",
      targetId: params.id,
      metadata: { reference: order.reference, failureReason },
    },
  });

  return NextResponse.json({ success: true });
}
