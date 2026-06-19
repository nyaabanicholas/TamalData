import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";

const PAYOUT_STATUS_COLOR: Record<string, string> = {
  PENDING:  "#f59e0b",
  APPROVED: "#3b82f6",
  PAID:     "#10b981",
  REJECTED: "#ef4444",
};
import { PayoutForm } from "./PayoutForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Earnings & Payouts" };

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [user, payouts, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, name: true },
    }),
    prisma.payoutRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const stats = await prisma.order.aggregate({
    where: { agentId: session.user.id, status: "DELIVERED" },
    _sum: { sellPrice: true, costPrice: true },
    _count: true,
  });

  const balance     = Number(user?.walletBalance ?? 0);
  const revenue     = Number(stats._sum.sellPrice ?? 0);
  const cost        = Number(stats._sum.costPrice ?? 0);
  const totalProfit = revenue - cost;
  const minPayout   = Number(settings?.minPayoutAmount ?? 20);
  const delivered   = stats._count;

  const pendingPayout = payouts.find((p) => p.status === "PENDING");

  return (
    <div className="container-content pt-4 pb-10">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-8">Earnings & Payouts</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Wallet Balance",  value: formatGHS(balance),     color: "var(--accent-primary)" },
          { label: "Total Revenue",   value: formatGHS(revenue),     color: "var(--accent-glow)" },
          { label: "Total Profit",    value: formatGHS(totalProfit), color: "var(--color-success)" },
          { label: "Orders Delivered",value: String(delivered),      color: "var(--text-secondary)" },
        ].map((s) => (
          <GlassPanel key={s.label} className="p-4">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
            <p className="font-display font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payout request */}
        <GlassPanel className="p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">Request Withdrawal</h2>
          {balance < minPayout ? (
            <div className="rounded-card p-4 bg-bg-elevated border border-color-border/40 text-center">
              <p className="text-text-secondary text-sm">Minimum payout is <span className="font-semibold text-text-primary">{formatGHS(minPayout)}</span></p>
              <p className="text-text-muted text-xs mt-1">Your balance: <span className="text-accent-primary font-semibold">{formatGHS(balance)}</span></p>
            </div>
          ) : pendingPayout ? (
            <div className="rounded-card p-4 bg-bg-elevated border border-color-border/40">
              <p className="text-text-secondary text-sm">You have a pending payout of</p>
              <p className="font-display font-bold text-2xl text-accent-primary mt-1">{formatGHS(Number(pendingPayout.amount))}</p>
              <p className="text-xs text-text-muted mt-2">Submitted {new Date(pendingPayout.createdAt).toLocaleDateString("en-GH")}</p>
            </div>
          ) : (
            <PayoutForm balance={balance} minPayout={minPayout} />
          )}
        </GlassPanel>

        {/* Payout history */}
        <GlassPanel className="overflow-hidden">
          <div className="px-4 py-3 border-b border-color-border/40">
            <h2 className="font-display font-semibold text-text-primary">Payout History</h2>
          </div>
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">No payout requests yet.</div>
          ) : (
            <ul className="divide-y divide-color-border/20">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-bg-elevated/40 transition-colors">
                  <div>
                    <p className="font-semibold text-text-primary">{formatGHS(Number(p.amount))}</p>
                    <p className="text-xs text-text-muted">{p.momoNetwork} · {p.momoPhone}</p>
                    <p className="text-xs text-text-muted mt-0.5">{new Date(p.createdAt).toLocaleDateString("en-GH")}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: (PAYOUT_STATUS_COLOR[p.status] ?? "#888") + "22", color: PAYOUT_STATUS_COLOR[p.status] ?? "#888" }}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
