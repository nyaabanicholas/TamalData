import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatGHS } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reseller Orders" };

const PAGE_SIZE = 20;

export default async function ResellerOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const status = searchParams.status;

  const where = {
    agentId: session.user.id,
    ...(status ? { status: status as never } : {}),
  };

  const [orders, total, stats] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where: { agentId: session.user.id, status: "DELIVERED" },
      _sum: { sellPrice: true, costPrice: true },
      _count: true,
    }),
  ]);

  const totalRevenue = Number(stats._sum.sellPrice ?? 0);
  const totalCost    = Number(stats._sum.costPrice ?? 0);
  const totalProfit  = totalRevenue - totalCost;
  const totalPages   = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container-content pt-4 pb-10">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-8">Reseller Orders</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders",    value: String(total),            color: "var(--accent-primary)" },
          { label: "Revenue",         value: formatGHS(totalRevenue),  color: "var(--accent-glow)" },
          { label: "Cost",            value: formatGHS(totalCost),     color: "var(--text-secondary)" },
          { label: "Net Profit",      value: formatGHS(totalProfit),   color: "var(--color-success)" },
        ].map((s) => (
          <GlassPanel key={s.label} className="p-4">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
            <p className="font-display font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
          </GlassPanel>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["", "PENDING", "DELIVERED", "FAILED", "REFUNDED"].map((s) => (
          <Link
            key={s || "all"}
            href={`/reseller/orders?${s ? `status=${s}` : ""}${page > 1 ? `&page=${page}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              (status ?? "") === s
                ? "bg-accent-primary text-white border-accent-primary"
                : "border-color-border text-text-secondary hover:border-accent-primary/50"
            }`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Date", "Reference", "Network", "Bundle", "Recipient", "Cost", "Sell", "Profit", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const cost   = Number(order.costPrice);
                const sell   = Number(order.sellPrice);
                const profit = sell - cost;
                return (
                  <tr key={order.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-GH")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-accent-primary whitespace-nowrap">
                      <Link href={`/track?ref=${order.reference}`} className="hover:underline">{order.reference}</Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary">{order.network}</td>
                    <td className="px-4 py-3 text-text-secondary">{order.bundleSize}</td>
                    <td className="px-4 py-3 font-mono text-text-secondary text-xs">{order.recipientPhone}</td>
                    <td className="px-4 py-3 text-text-muted">{formatGHS(cost)}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">{formatGHS(sell)}</td>
                    <td className="px-4 py-3">
                      <span className={profit >= 0 ? "text-color-success font-semibold" : "text-color-error"}>
                        {profit >= 0 ? "+" : ""}{formatGHS(profit)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-color-border/40">
            <p className="text-xs text-text-muted">Page {page} of {totalPages} · {total} orders</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/reseller/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs hover:border-accent-primary/50 transition-colors">
                  ← Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/reseller/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs hover:border-accent-primary/50 transition-colors">
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
