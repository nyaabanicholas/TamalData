import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";
import type { Network } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Customers" };

const NETWORK_COLORS: Record<Network, string> = {
  MTN: "#00a86b",
  TELECEL: "#f59e0b",
  AIRTELTIGO: "#ef4444",
};

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/reseller/customers");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, resellerStatus: true },
  });

  const isReseller = user?.role === "RESELLER" && user.resellerStatus === "APPROVED";
  if (!isReseller) {
    redirect("/reseller");
  }

  // Get customers for this reseller
  const [customers, totalOrders, totalRevenue, recentCustomers] = await Promise.all([
    prisma.customer.findMany({
      where: { agentId: session.user.id },
      orderBy: { lastOrderAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        network: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderAt: true,
        createdAt: true,
      },
    }),
    prisma.customer.aggregate({
      where: { agentId: session.user.id },
      _sum: { totalOrders: true },
    }),
    prisma.customer.aggregate({
      where: { agentId: session.user.id },
      _sum: { totalSpent: true },
    }),
    prisma.customer.findMany({
      where: { agentId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        phone: true,
        network: true,
        totalOrders: true,
        totalSpent: true,
        createdAt: true,
      },
    }),
  ]);

  const totalCustomerOrders = (totalOrders as { _sum: { totalOrders: number | null } })._sum.totalOrders ?? 0;
  const totalCustomerRevenue = (totalRevenue as { _sum: { totalSpent: number | null } })._sum.totalSpent ?? 0;

  // Network distribution
  const networkCounts = await prisma.customer.groupBy({
    by: ["network"],
    where: { agentId: session.user.id },
    _count: true,
    _sum: { totalSpent: true },
  });

  const networkMap = Object.fromEntries(
    (networkCounts as Array<{ network: Network; _count: number; _sum: { totalSpent: number | null } }>).map((n) => [
      n.network,
      { count: n._count, revenue: n._sum.totalSpent ?? 0 },
    ])
  );

  return (
    <div className="container-content pt-4 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-text-primary">My Customers</h1>
          <p className="text-text-secondary text-sm mt-1">
            Track and manage your customer base
          </p>
        </div>
        <Link href="/reseller">
          <button className="px-4 py-2 rounded-btn border border-color-border text-text-secondary text-xs hover:bg-bg-elevated transition-colors">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Customers", value: String(customers.length), color: "var(--accent-primary)" },
          { label: "Total Orders", value: String(totalCustomerOrders), color: "var(--accent-glow)" },
          { label: "Total Revenue", value: formatGHS(totalCustomerRevenue), color: "var(--color-success)" },
          { label: "Avg. Order Value", value: totalCustomerOrders > 0 ? formatGHS(totalCustomerRevenue / totalCustomerOrders) : "GH₵0.00", color: "var(--color-warning)" },
        ].map((s) => (
          <GlassPanel key={s.label} className="p-4">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
            <p className="font-display font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
          </GlassPanel>
        ))}
      </div>

      {/* Network Distribution */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(Object.keys(NETWORK_COLORS) as Network[]).map((net) => {
          const data = networkMap[net];
          const count = data?.count ?? 0;
          const revenue = data?.revenue ?? 0;
          return (
            <GlassPanel key={net} className="p-4 text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{net}</p>
              <p className="font-display font-bold text-xl" style={{ color: NETWORK_COLORS[net] }}>
                {count}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {count > 0 ? formatGHS(revenue) : "No customers"}
              </p>
            </GlassPanel>
          );
        })}
      </div>

      {/* Recent Customers */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-lg text-text-primary mb-4">Recent Customers</h2>
        {customers.length === 0 ? (
          <GlassPanel className="p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium text-text-secondary">No customers yet</p>
            <p className="text-sm text-text-muted mt-1">
              Customers will appear here when they purchase from your store
            </p>
          </GlassPanel>
        ) : (
          <GlassPanel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-color-border/40">
                    {["Customer", "Phone", "Network", "Orders", "Total Spent", "Last Order"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">
                          {customer.name || customer.phone.slice(-4)}
                        </div>
                        <div className="text-xs text-text-muted">
                          {customer.name ? customer.phone : "Anonymous"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-secondary text-xs">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3">
                        {customer.network && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: (NETWORK_COLORS[customer.network] ?? "#888") + "22",
                              color: NETWORK_COLORS[customer.network] ?? "#888",
                            }}
                          >
                            {customer.network}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text-primary">
                        {customer.totalOrders}
                      </td>
                      <td className="px-4 py-3 font-mono text-text-primary">
                        {formatGHS(Number(customer.totalSpent))}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {customer.lastOrderAt
                          ? new Date(customer.lastOrderAt).toLocaleDateString("en-GH")
                          : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        )}
      </div>

      {/* New vs Returning Customers */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassPanel className="p-6">
          <h3 className="font-display font-semibold text-text-primary mb-4">New Customers</h3>
          <p className="text-2xl font-bold text-accent-primary">
            {recentCustomers.length}
          </p>
          <p className="text-sm text-text-muted mt-1">
            Customers who placed their first order recently
          </p>
          {recentCustomers.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {recentCustomers.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <span className="text-text-primary">{c.phone}</span>
                  <span className="text-text-muted text-xs">
                    {new Date(c.createdAt).toLocaleDateString("en-GH")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>

        <GlassPanel className="p-6">
          <h3 className="font-display font-semibold text-text-primary mb-4">Customer Loyalty</h3>
          <div className="space-y-2">
            {[
              { label: "Single Order", count: customers.filter((c) => c.totalOrders === 1).length },
              { label: "2-5 Orders", count: customers.filter((c) => c.totalOrders >= 2 && c.totalOrders <= 5).length },
              { label: "6-10 Orders", count: customers.filter((c) => c.totalOrders >= 6 && c.totalOrders <= 10).length },
              { label: "10+ Orders", count: customers.filter((c) => c.totalOrders > 10).length },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{item.count}</span>
                  <div className="w-16 h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-primary rounded-full transition-all"
                      style={{
                        width: customers.length > 0 ? `${(item.count / customers.length) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
