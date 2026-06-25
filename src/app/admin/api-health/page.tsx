import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";
import { getBalance } from "@/lib/datamart";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — API Health" };

async function getApiHealth() {
  try {
    const result = await getBalance();
    return { ok: true, balance: result.balance };
  } catch (e) {
    return { ok: false, balance: 0, error: String(e) };
  }
}

export default async function ApiHealthPage() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  const [health, failedOrders, settings] = await Promise.all([
    getApiHealth(),
    prisma.order.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, reference: true, network: true, bundleSize: true, failureReason: true, createdAt: true, recipientPhone: true },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const networkStatuses = [
    { name: "MTN",        status: settings?.mtnStatus        ?? "OPERATIONAL" },
    { name: "Telecel",    status: settings?.telecelStatus    ?? "OPERATIONAL" },
    { name: "AirtelTigo", status: settings?.airteltigoStatus ?? "OPERATIONAL" },
  ];

  const STATUS_COLOR: Record<string, string> = { OPERATIONAL: "#10b981", DEGRADED: "#f59e0b", DOWN: "#ef4444" };

  return (
    <div className="container-content py-10">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-8">API Health</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">DataMart Status</p>
          <p className="font-display font-bold text-xl" style={{ color: health.ok ? "#10b981" : "#ef4444" }}>
            {health.ok ? "Online" : "Offline"}
          </p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">DataMart Balance</p>
          <p className="font-display font-bold text-xl text-accent-primary">
            {health.ok ? formatGHS(health.balance) : "—"}
          </p>
        </GlassPanel>
        {networkStatuses.map((n) => (
          <GlassPanel key={n.name} className="p-4">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{n.name}</p>
            <p className="font-display font-bold text-lg" style={{ color: STATUS_COLOR[n.status] ?? "#888" }}>
              {n.status}
            </p>
          </GlassPanel>
        ))}
      </div>

      {!health.ok && (
        <GlassPanel className="p-4 mb-6 border border-color-error/40">
          <p className="text-color-error font-semibold text-sm">DataMart API Error</p>
          <p className="text-text-muted text-xs mt-1 font-mono">{health.error}</p>
        </GlassPanel>
      )}

      <GlassPanel className="overflow-hidden">
        <div className="px-4 py-3 border-b border-color-border/40">
          <h2 className="font-display font-semibold text-text-primary">Recent Failed Orders ({failedOrders.length})</h2>
        </div>
        {failedOrders.length === 0 ? (
          <p className="p-8 text-center text-color-success text-sm font-semibold">No failed orders recently!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-color-border/40">
                  {["Date", "Ref", "Network", "Bundle", "Recipient", "Reason"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {failedOrders.map((o) => (
                  <tr key={o.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-4 py-3 text-text-muted text-xs">{new Date(o.createdAt).toLocaleDateString("en-GH")}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent-primary">{o.reference}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">{o.network}</td>
                    <td className="px-4 py-3 text-text-secondary">{o.bundleSize}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{o.recipientPhone}</td>
                    <td className="px-4 py-3 text-color-error text-xs">{o.failureReason ?? "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
