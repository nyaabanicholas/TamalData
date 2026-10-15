import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
  if (!session || role !== "ADMIN") redirect("/sign-in");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    todayOrders,
    totalRevenue,
    recentOrders,
    failedToday,
    totalUsers,
    totalResellers,
    walletCredits,
    walletDebits,
    ordersByNetwork,
    revenueWeek,
    revenueMonth,
    pendingPayouts,
    pendingResellers,
    pendingFulfillment,
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
    prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "CREDIT" },
    }),
    prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "DEBIT" },
    }),
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
    prisma.order.count({ where: { status: "PENDING_FULFILLMENT" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const walletFunds = Math.max(0, Number(walletCredits._sum.amount ?? 0) - Number(walletDebits._sum.amount ?? 0));
  const needsAttention = failedToday + pendingFulfillment + pendingPayouts + pendingResellers;

  return (
    <div className="min-h-screen bg-bg-base px-4 py-8 sm:px-8">
      <div className="max-w-content mx-auto">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl text-text-primary">Overview</h1>
            <p className="mt-1 text-sm text-text-muted">
              {now.toLocaleDateString("en-GH", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${
              needsAttention > 0
                ? "bg-color-warning/10 text-color-warning ring-color-warning/25"
                : "bg-color-success/10 text-color-success ring-color-success/25"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {needsAttention > 0 ? `${needsAttention} item${needsAttention === 1 ? "" : "s"} need attention` : "All clear"}
          </span>
        </header>

        <NetworkStatusPanel
          mtnStatus={siteSettings?.mtnStatus ?? "OPERATIONAL"}
          telecelStatus={siteSettings?.telecelStatus ?? "OPERATIONAL"}
          airteltigoStatus={siteSettings?.airteltigoStatus ?? "OPERATIONAL"}
        />

        <KpiGroup title="Revenue">
          <KpiCard label="All time" value={formatGHS(Number(totalRevenue._sum.sellPrice ?? 0))} hero />
          <KpiCard label="Last 30 days" value={formatGHS(Number(revenueMonth._sum.sellPrice ?? 0))} />
          <KpiCard label="Last 7 days" value={formatGHS(Number(revenueWeek._sum.sellPrice ?? 0))} />
          <KpiCard label="Wallet funds held" value={formatGHS(walletFunds)} />
        </KpiGroup>

        <KpiGroup title="Needs attention">
          <KpiCard label="Failed today" value={String(failedToday)} href="/admin/orders" warn={failedToday > 0} />
          <KpiCard label="Pending fulfillment" value={String(pendingFulfillment)} href="/admin/fulfillment" warn={pendingFulfillment > 0} />
          <KpiCard label="Pending payouts" value={String(pendingPayouts)} href="/admin/payouts" warn={pendingPayouts > 0} />
          <KpiCard label="Pending resellers" value={String(pendingResellers)} href="/admin/resellers" warn={pendingResellers > 0} />
        </KpiGroup>

        <KpiGroup title="Platform">
          <KpiCard label="Orders today" value={String(todayOrders)} />
          <KpiCard label="Total users" value={String(totalUsers)} />
          <KpiCard label="Resellers" value={String(totalResellers)} />
        </KpiGroup>

        {/* Orders by network - mini breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {(["MTN", "TELECEL", "AIRTELTIGO"] as const).map((net) => {
            const count = ordersByNetwork.find((o) => o.network === net)?._count ?? 0;
            return (
              <div key={net} className="liquid-glass rounded-[1.25rem] p-4 text-center">
                <p className="text-xs font-medium text-text-muted mb-1">{net}</p>
                <p className="font-display font-semibold text-2xl text-text-primary tabular-nums">{count}</p>
                <p className="text-[11px] text-text-muted">orders today</p>
              </div>
            );
          })}
        </div>

        {/* Recent orders table */}
        <GlassPanel>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-text-primary">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-accent-primary transition-colors hover:text-accent-glow"
            >
              View all
            </Link>
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

function KpiGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium text-text-muted">{title}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function KpiCard({
  label,
  value,
  warn = false,
  hero = false,
  href,
}: {
  label: string;
  value: string;
  warn?: boolean;
  hero?: boolean;
  href?: string;
}) {
  const body = (
    <GlassPanel
      className={`h-full p-5 ${warn ? "ring-1 ring-inset ring-color-warning/30" : ""} ${
        href ? "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5" : ""
      }`}
    >
      <p className="flex items-center gap-2 text-xs font-medium text-text-muted">
        {warn && <span className="h-1.5 w-1.5 rounded-full bg-color-warning" />}
        {label}
      </p>
      <p
        className={`mt-2 font-display font-semibold tabular-nums tracking-tight ${hero ? "text-3xl" : "text-2xl"} ${
          warn ? "text-color-warning" : hero ? "text-accent-primary" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </GlassPanel>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
