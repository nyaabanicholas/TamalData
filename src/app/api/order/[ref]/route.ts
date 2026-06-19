import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrderStatus } from "@/lib/datamart";
import { maskPhone } from "@/lib/utils";

const GHANA_PHONE = /^0[2345][0-9]{8}$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: { ref: string } }
) {
  const { ref } = params;

  if (!ref) {
    return NextResponse.json({ error: "Invalid reference or phone number" }, { status: 400 });
  }

  let order;

  // Allow searching by phone number (Ghana format)
  if (GHANA_PHONE.test(ref)) {
    order = await prisma.order.findFirst({
      where: { recipientPhone: ref },
      orderBy: { createdAt: "desc" },
    });
    if (!order) {
      return NextResponse.json({ error: "No orders found for this phone number" }, { status: 404 });
    }
  } else if (ref.startsWith("TAMAL-")) {
    order = await prisma.order.findUnique({ where: { reference: ref } });
  } else {
    return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If still processing, check DataMart for live status
  if (
    order.datamartRef &&
    (order.status === "PROCESSING" || order.status === "PAYMENT_CONFIRMED")
  ) {
    try {
      const dmStatus = await getOrderStatus(order.datamartRef);
      if (dmStatus.orderStatus === "completed") {
        await prisma.order.update({
          where: { reference: ref },
          data: { status: "DELIVERED", deliveredAt: new Date() },
        });
        order.status = "DELIVERED";
        order.deliveredAt = new Date();
      }
    } catch {
      // Non-fatal — return what we have in DB
    }
  }

  return NextResponse.json({
    id:             order.id,
    reference:      order.reference,
    network:        order.network,
    bundleSize:     order.bundleSize,
    bundleValidity: order.bundleValidity,
    recipientPhone: maskPhone(order.recipientPhone),
    sellPrice:      Number(order.sellPrice),
    paymentMethod:  order.paymentMethod,
    paymentRef:     order.paymentRef ?? null,
    status:         order.status,
    datamartRef:    order.datamartRef ?? null,
    failureReason:  order.failureReason ?? null,
    deliveredAt:    order.deliveredAt?.toISOString() ?? null,
    updatedAt:      order.updatedAt.toISOString(),
    createdAt:      order.createdAt.toISOString(),
  });
}
