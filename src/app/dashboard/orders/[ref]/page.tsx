import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderTimeline } from "@/components/ui/OrderTimeline";
import { formatGHS } from "@/lib/utils";
import type { Metadata } from "next";
import type { OrderStatus, PaymentMethod } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { ref: string } }): Promise<Metadata> {
  return { title: `Order ${params.ref}` };
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  MTN_MOMO:         "MTN Mobile Money",
  TELECEL_CASH:     "Telecel Cash",
  AIRTELTIGO_MONEY: "AirtelTigo Money",
  WALLET:           "Wallet",
};

const STATUS_DETAIL: Record<string, string> = {
  PENDING:           "Waiting for payment confirmation from your MoMo provider.",
  PAYMENT_CONFIRMED: "Payment confirmed. Your order has been queued for delivery.",
  PROCESSING:        "Order submitted to the network. Data bundle is being sent to the recipient.",
  DELIVERED:         "Data bundle has been successfully sent to the recipient number.",
  FAILED:            "Delivery failed. You will be refunded if payment was collected.",
  REFUNDED:          "This order has been refunded to your wallet.",
};

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-color-border/20 last:border-0">
      <span className="text-xs text-text-muted uppercase tracking-wider font-medium w-40 shrink-0">{label}</span>
      <span className={`text-sm text-text-primary break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: { ref: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/auth/login?from=/dashboard/orders/${params.ref}`);

  const order = await prisma.order.findUnique({ where: { reference: params.ref } });

  if (!order) notFound();

  // Non-admin users can only see their own orders
  const role = (session.user as never as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && order.userId !== session.user.id) notFound();

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content pt-28 pb-10 max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link href="/dashboard" className="text-text-muted hover:text-text-primary transition-colors">Dashboard</Link>
          <span className="text-text-muted">/</span>
          <Link href="/dashboard/orders" className="text-text-muted hover:text-text-primary transition-colors">Orders</Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-mono text-xs">{order.reference}</span>
        </div>

        {/* Status hero */}
        <GlassPanel className="p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-text-muted font-mono mb-1">{order.reference}</p>
              <h1 className="font-heading text-2xl text-text-primary">
                {order.bundleSize} — {order.network}
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                {STATUS_DETAIL[order.status]}
              </p>
            </div>
            <StatusBadge status={order.status as OrderStatus} />
          </div>

          <OrderTimeline
            status={order.status as OrderStatus}
            timestamps={{
              PLACED:    order.createdAt.toISOString(),
              DELIVERED: order.deliveredAt?.toISOString(),
            }}
          />

          {order.status === "DELIVERED" && (
            <p className="mt-4 text-emerald-400 text-sm font-medium">
              ✓ Data delivered to {order.recipientPhone}
            </p>
          )}

          {order.status === "FAILED" && order.failureReason && (
            <p className="mt-4 text-red-400 text-sm">{order.failureReason}</p>
          )}
        </GlassPanel>

        {/* Full order info */}
        <GlassPanel className="p-6 mb-4">
          <h2 className="font-semibold text-text-primary mb-4 text-xs uppercase tracking-wider">Order Details</h2>
          <Row label="Order ID"       value={order.id}                                               mono />
          <Row label="Reference"      value={order.reference}                                        mono />
          <Row label="Network"        value={order.network} />
          <Row label="Bundle"         value={`${order.bundleSize} — ${order.bundleValidity}`} />
          <Row label="Recipient"      value={order.recipientPhone}                                   mono />
          <Row label="Amount Paid"    value={formatGHS(Number(order.sellPrice))} />
          <Row label="Payment Method" value={PAYMENT_METHOD_LABEL[order.paymentMethod as PaymentMethod] ?? order.paymentMethod} />
          {order.paymentRef && (
            <Row label="Payment Ref"  value={order.paymentRef}                                       mono />
          )}
          {order.datamartRef && (
            <Row label="DataMart Ref" value={order.datamartRef}                                      mono />
          )}
        </GlassPanel>

        {/* Timestamps */}
        <GlassPanel className="p-6">
          <h2 className="font-semibold text-text-primary mb-4 text-xs uppercase tracking-wider">Timeline</h2>
          <Row label="Order Placed"  value={order.createdAt.toLocaleString("en-GH")} />
          <Row label="Last Updated"  value={order.updatedAt.toLocaleString("en-GH")} />
          {order.deliveredAt && (
            <Row label="Delivered At" value={order.deliveredAt.toLocaleString("en-GH")} />
          )}
        </GlassPanel>

        {["PENDING", "PAYMENT_CONFIRMED", "PROCESSING"].includes(order.status) && (
          <div className="mt-4 text-center">
            <Link
              href={`/track?ref=${order.reference}`}
              className="text-xs text-accent-primary hover:underline"
            >
              Track this order on the public tracker →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
