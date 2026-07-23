import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";
import { FulfillActions } from "./FulfillActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fulfillment — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminFulfillmentPage() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  const pendingOrders = await prisma.order.findMany({
    where: { status: "PENDING_FULFILLMENT" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="min-h-screen bg-bg-base p-8">
      <div className="max-w-content mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin" className="text-text-muted hover:text-text-primary text-sm transition-colors">
            ← Dashboard
          </a>
          <h1 className="font-display font-bold text-3xl text-text-primary">
            Fulfill Orders
          </h1>
          <span className="text-text-muted text-sm ml-auto">
            {pendingOrders.length} awaiting fulfillment
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <GlassPanel>
            <p className="text-text-muted py-8 text-center">
              No orders awaiting fulfillment.
            </p>
          </GlassPanel>
        ) : (
          <>
            {/* Instructions */}
            <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-4 mb-6 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary mb-1">How to fulfill</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Buy the data bundle from DataMart for the customer</li>
                <li>Once DataMart confirms delivery, click <strong className="text-text-primary">Mark Delivered</strong></li>
                <li>The customer will receive an SMS notification</li>
              </ol>
            </div>

            <GlassPanel>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted border-b border-color-border">
                      <th className="text-left py-2 pr-4 font-medium">Reference</th>
                      <th className="text-left py-2 pr-4 font-medium">Customer</th>
                      <th className="text-left py-2 pr-4 font-medium">Network</th>
                      <th className="text-left py-2 pr-4 font-medium">Bundle</th>
                      <th className="text-left py-2 pr-4 font-medium">Phone</th>
                      <th className="text-left py-2 pr-4 font-medium">Amount</th>
                      <th className="text-left py-2 pr-4 font-medium">Paid Via</th>
                      <th className="text-left py-2 pr-4 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-color-border/40 hover:bg-bg-elevated/30 transition-colors"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-text-secondary">
                          {order.reference}
                        </td>
                        <td className="py-3 pr-4 text-text-primary">
                          {order.user?.name ?? "Guest"}
                        </td>
                        <td className="py-3 pr-4 text-text-primary">{order.network}</td>
                        <td className="py-3 pr-4">
                          <span className="text-text-primary">{order.bundleSize}</span>
                          <span className="text-text-muted ml-1 text-xs">{order.bundleValidity}</span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-text-secondary">
                          {order.recipientPhone}
                        </td>
                        <td className="py-3 pr-4 font-mono text-text-primary">
                          {formatGHS(Number(order.sellPrice))}
                        </td>
                        <td className="py-3 pr-4 text-xs text-text-secondary">
                          {order.paymentMethod}
                        </td>
                        <td className="py-3 pr-4 text-text-muted text-xs">
                          {new Date(order.createdAt).toLocaleDateString("en-GH", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3">
                          <FulfillActions
                            orderId={order.id}
                            reference={order.reference}
                            phone={order.recipientPhone}
                            bundleSize={order.bundleSize}
                            network={order.network}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          </>
        )}
      </div>
    </div>
  );
}
