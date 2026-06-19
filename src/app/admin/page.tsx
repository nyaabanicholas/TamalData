import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatGHS } from "@/lib/utils";
import { NetworkStatusPanel } from "./NetworkStatusPanel";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/auth/login");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    todayOrders,
    totalRevenue,
    recentOrders,
    failedToday,
    totalUsers,
    totalResellers,
    totalWalletFunds,
    ordersByNetwork,
    revenueWeek,
    revenueMonth,
    pendingPayouts,
    pendingResellers,
    siteSettings,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      _sum: { sellPrice: true },
      where: { status: "DELIVERED" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
    prisma.order.count({
      where: { status: "FAILED", createdAt: { gte: todayStart } },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "RESELLER" } }),
    prisma.user.aggregate({ _sum: { walletBalance: true } }),
    prisma.order.groupBy({
      by: ["network"],
      _count: true,
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      _sum: { sellPrice: true },
      where: {
        status: "DELIVERED",
        createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
      },
    }),
    prisma.order.aggregate({
      _sum: { sellPrice: true },
      where: {
        status: "DELIVERED",
        createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
      },
    }),
    prisma.payoutRequest.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "RESELLER", resellerStatus: "PENDING_APPROVAL" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <div className="min-h-screen bg-bg-base pt-8 pb-8 px-8">
      <div className="max-w-content mx-auto">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-6">
          Admin Dashboard
        </h1>

        <NetworkStatusPanel
          mtnStatus={siteSettings?.mtnStatus ?? "OPERATIONAL"}
          telecelStatus={siteSettings?.telecelStatus ?? "OPERATIONAL"}
          airteltigoStatus={siteSettings?.airteltigoStatus ?? "OPERATIONAL"}
        />

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Today's Orders" value={String(todayOrders)} />
          <KpiCard label="Total Revenue (All)" value={formatGHS(Number(totalRevenue._sum.sellPrice ?? 0))} />
          <KpiCard label="Revenue (7d)" value={formatGHS(Number(revenueWeek._sum.sellPrice ?? 0))} />
          <KpiCard label="Revenue (30d)" value={formatGHS(Number(revenueMonth._sum.sellPrice ?? 0))} />
          <KpiCard label="Total Users" value={String(totalUsers)} />
          <KpiCard label="Resellers" value={String(totalResellers)} accent />
          <KpiCard label="Wallet Funds" value={formatGHS(Number(totalWalletFunds._sum.walletBalance ?? 0))} />
          <KpiCard label="Failed Today" value={String(failedToday)} warn={failedToday > 0} />
          <KpiCard label="Pending Payouts" value={String(pendingPayouts)} warn={pendingPayouts > 0} />
          <KpiCard label="Pending Resellers" value={String(pendingResellers)} warn={pendingResellers > 0} />
        </div>

        {/* Orders by network - mini breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {(["MTN", "TELECEL", "AIRTELTIGO"] as const).map((net) => {
            const count = ordersByNetwork.find((o) => o.network === net)?._count ?? 0;
            return (
              <div key={net} className="liquid-glass rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{net}</p>
                <p className="font-display font-bold text-2xl text-text-primary">{count}</p>
                <p className="text-[10px] text-text-muted">orders today</p>
              </div>
            );
          })}
        </div>

        {/* Recent orders table */}
        <GlassPanel>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-text-primary">
              Recent Orders
            </h2>
            <a
              href="/admin/orders"
              className="text-sm text-accent-glow hover:underline"
            >
              View all
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-color-border">
                  <th className="text-left py-2 pr-4 font-medium">Reference</th>
                  <th className="text-left py-2 pr-4 font-medium">Network</th>
                  <th className="text-left py-2 pr-4 font-medium">Bundle</th>
                  <th className="text-left py-2 pr-4 font-medium">Amount</th>
                  <th className="text-left py-2 pr-4 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-color-border/50 hover:bg-bg-elevated/30 transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono text-xs text-text-secondary">
                      {order.reference}
                    </td>
                    <td className="py-3 pr-4 text-text-primary">{order.network}</td>
                    <td className="py-3 pr-4 text-text-primary">{order.bundleSize}</td>
                    <td className="py-3 pr-4 font-mono text-text-primary">
                      {formatGHS(Number(order.sellPrice))}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="py-3 text-text-muted text-xs">
                      {new Date(order.createdAt).toLocaleTimeString("en-GH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  warn = false,
  accent = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
  accent?: boolean;
}) {
  return (
    <GlassPanel>
      <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">{label}</p>
      <p
        className={`font-display font-bold text-2xl ${
          warn ? "text-color-warning" : accent ? "text-accent-primary" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </GlassPanel>
  );
}
