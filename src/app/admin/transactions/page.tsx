import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Transactions" };

const TYPE_COLORS: Record<string, string> = {
  CREDIT: "#10b981",
  DEBIT: "#ef4444",
  COMMISSION: "#3b82f6",
  PAYOUT: "#f59e0b",
};

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { type?: string; page?: string };
}) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/auth/login");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 30;
  const typeFilter = searchParams.type;

  const where = {
    ...(typeFilter ? { type: typeFilter as never } : {}),
  };

  const [txns, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, phone: true } },
      },
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Aggregate totals
  const totals = await prisma.walletTransaction.groupBy({
    by: ["type"],
    _sum: { amount: true },
  });
  const totalCredits = totals.find((t) => t.type === "CREDIT")?._sum.amount ?? 0;
  const totalDebits = totals.find((t) => t.type === "DEBIT")?._sum.amount ?? 0;
  const totalCommissions = totals.find((t) => t.type === "COMMISSION")?._sum.amount ?? 0;
  const totalPayouts = totals.find((t) => t.type === "PAYOUT")?._sum.amount ?? 0;

  return (
    <div className="container-content py-10">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-8">Wallet Transactions</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Total Credits</p>
          <p className="font-display font-bold text-lg text-color-success">{formatGHS(Number(totalCredits))}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Total Debits</p>
          <p className="font-display font-bold text-lg text-color-error">{formatGHS(Number(totalDebits))}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Total Commissions</p>
          <p className="font-display font-bold text-lg text-accent-primary">{formatGHS(Number(totalCommissions))}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Total Payouts</p>
          <p className="font-display font-bold text-lg text-accent-orange">{formatGHS(Number(totalPayouts))}</p>
        </GlassPanel>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[["", "All"], ["CREDIT", "Credits"], ["DEBIT", "Debits"], ["COMMISSION", "Commissions"], ["PAYOUT", "Payouts"]].map(([t, label]) => (
          <Link key={t || "all"} href={`/admin/transactions${t ? `?type=${t}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              (typeFilter ?? "") === t
                ? "bg-accent-primary text-white border-accent-primary"
                : "border-color-border text-text-secondary"
            }`}>
            {label}
          </Link>
        ))}
      </div>

      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Date", "User", "Phone", "Type", "Amount", "Description", "Order Ref"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString("en-GH")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-text-primary text-xs">{t.user.name}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary text-xs">{t.user.phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{ backgroundColor: (TYPE_COLORS[t.type] ?? "#888") + "22", color: TYPE_COLORS[t.type] ?? "#888" }}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-primary text-xs">
                    {t.type === "CREDIT" || t.type === "COMMISSION" ? "+" : "-"}{formatGHS(Number(t.amount))}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs max-w-[200px] truncate" title={t.description}>
                    {t.description}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-text-muted">
                    {t.orderId ? (
                      <Link href={`/admin/orders?q=${t.orderId}`} className="hover:text-accent-primary transition-colors">
                        {t.orderId.slice(0, 12)}…
                      </Link>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {txns.length === 0 && (
            <p className="p-8 text-center text-text-muted text-sm">No transactions found.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-color-border/40">
            <p className="text-xs text-text-muted">Page {page} of {totalPages} · {total} transactions</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/transactions?page=${page - 1}${typeFilter ? `&type=${typeFilter}` : ""}`}
                  className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs">← Prev</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/transactions?page=${page + 1}${typeFilter ? `&type=${typeFilter}` : ""}`}
                  className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs">Next →</Link>
              )}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
