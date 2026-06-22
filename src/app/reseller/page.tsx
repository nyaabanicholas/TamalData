import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatGHS } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reseller Portal" };

export default async function ResellerPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?from=/reseller");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, resellerStatus: true, walletBalance: true, name: true, phone: true },
  });

  const isReseller = user?.role === "RESELLER" && user.resellerStatus === "APPROVED";
  const isPending = user?.role === "RESELLER" && user.resellerStatus === "PENDING_APPROVAL";

  // Layout already gates non-resellers — this fallback is for safety

  const [orders, totalRevenue, deliveredCount] = isReseller || user?.role === "ADMIN"
    ? await Promise.all([
        prisma.order.findMany({
          where: { agentId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true, reference: true, network: true, bundleSize: true,
            costPrice: true, sellPrice: true, status: true, createdAt: true, recipientPhone: true,
          },
        }),
        prisma.order.aggregate({
          where: { agentId: session.user.id, status: "DELIVERED" },
          _sum: { sellPrice: true },
        }),
        prisma.order.count({ where: { agentId: session.user.id, status: "DELIVERED" } }),
      ])
    : [[], { _sum: { sellPrice: null } }, 0];

  const revenue = (totalRevenue as { _sum: { sellPrice: number | null } })._sum.sellPrice ?? 0;

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content pt-4 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest"
                style={{ backgroundColor: "rgba(0,157,249,0.1)", color: "var(--accent-primary)" }}>
                Reseller Portal
              </span>
              {isPending && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest"
                  style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "var(--color-warning)" }}>
                  Pending Approval
                </span>
              )}
            </div>
            <h1 className="font-display font-extrabold text-3xl text-text-primary">
              {user?.name ?? user?.phone}
            </h1>
          </div>
          {isReseller && (
            <Link href="/buy">
              <GlowButton size="md">+ Place Order</GlowButton>
            </Link>
          )}
        </div>

        {isPending ? (
          <GlassPanel className="p-12 text-center max-w-xl mx-auto">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="font-display font-bold text-xl text-text-primary mb-2">
              Application Under Review
            </h2>
            <p className="text-text-secondary text-sm">
              Your reseller application is being reviewed. You&apos;ll receive an SMS once approved.
              Approval usually takes 24–48 hours.
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <GlowButton variant="ghost" size="sm">← Back to Dashboard</GlowButton>
              </Link>
            </div>
          </GlassPanel>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Wallet Balance", value: formatGHS(Number(user?.walletBalance ?? 0)), color: "var(--accent-primary)" },
                { label: "Total Revenue",  value: formatGHS(revenue),                  color: "var(--color-success)" },
                { label: "Orders Delivered", value: String(deliveredCount),             color: "var(--accent-orange)" },
                { label: "Reseller Tier", value: "8% Markup",                          color: "var(--color-warning)" },
              ].map((kpi) => (
                <GlassPanel key={kpi.label} className="p-5">
                  <p className="text-xs text-text-muted uppercase tracking-widest mb-2">{kpi.label}</p>
                  <p className="font-display font-extrabold text-2xl" style={{ color: kpi.color }}>
                    {kpi.value}
                  </p>
                </GlassPanel>
              ))}
            </div>

            {/* Info card */}
            <GlassPanel className="p-5 mb-8 flex gap-4 items-start border-l-2" style={{ borderLeftColor: "var(--accent-primary)" }}>
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-semibold text-text-primary text-sm mb-1">Your Reseller Advantage</p>
                <p className="text-xs text-text-secondary">
                  You buy at wholesale pricing — retail customers pay the standard rate.
                  Your margin is the difference. Build your own customer base and pocket the spread.
                </p>
              </div>
            </GlassPanel>

            {/* Recent orders */}
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-4">Recent Orders</h2>
              {(orders as typeof orders).length === 0 ? (
                <GlassPanel className="p-12 text-center">
                  <p className="text-4xl mb-3">📊</p>
                  <p className="font-medium text-text-secondary">No orders yet</p>
                  <p className="text-sm text-text-muted mt-1 mb-6">
                    Place your first reseller order to get started.
                  </p>
                  <Link href="/buy">
                    <GlowButton size="sm">Buy Data for a Customer</GlowButton>
                  </Link>
                </GlassPanel>
              ) : (
                <GlassPanel className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-color-border/40">
                          {["Date", "Network", "Bundle", "Recipient", "Cost", "Sell", "Profit", "Status"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(orders as typeof orders).map((order) => {
                          const profit = Number(order.sellPrice) - Number(order.costPrice);
                          return (
                            <tr key={order.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                              <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                                {new Date(order.createdAt).toLocaleDateString("en-GH")}
                              </td>
                              <td className="px-4 py-3 font-semibold text-text-primary">{order.network}</td>
                              <td className="px-4 py-3 text-text-secondary">{order.bundleSize}</td>
                              <td className="px-4 py-3 font-mono text-text-secondary text-xs">{order.recipientPhone}</td>
                              <td className="px-4 py-3 text-text-secondary">{formatGHS(Number(order.costPrice))}</td>
                              <td className="px-4 py-3 text-text-primary font-semibold">{formatGHS(Number(order.sellPrice))}</td>
                              <td className="px-4 py-3">
                                <span className="text-color-success font-semibold">+{formatGHS(profit)}</span>
                              </td>
                              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassPanel>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
