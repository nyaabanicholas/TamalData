import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Transactions — TamalData" };

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  CREDIT:     { label: "Top-up",     color: "text-color-success" },
  DEBIT:      { label: "Purchase",   color: "text-color-error" },
  COMMISSION: { label: "Commission", color: "text-accent-cyan" },
  PAYOUT:     { label: "Payout",     color: "text-accent-orange" },
};

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?from=/dashboard/transactions");

  const txns = await prisma.walletTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content pt-28 pb-10">
        <h1 className="font-heading text-3xl text-text-primary mb-2">Wallet Transactions</h1>
        <p className="text-text-muted text-sm mb-8">Your credit, debit, commission, and payout history.</p>

        {txns.length === 0 ? (
          <div className="liquid-glass rounded-2xl p-16 text-center">
            <p className="text-4xl mb-3">💳</p>
            <p className="text-text-secondary font-medium">No transactions yet</p>
            <p className="text-text-muted text-sm mt-1">Top up your wallet to get started.</p>
          </div>
        ) : (
          <div className="liquid-glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-color-border/40">
                    {["Date", "Type", "Description", "Amount"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-text-muted font-medium text-xs uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txns.map((txn, i) => {
                    const meta = TYPE_LABEL[txn.type] ?? { label: txn.type, color: "text-text-primary" };
                    const isCredit = txn.type === "CREDIT" || txn.type === "COMMISSION";
                    return (
                      <tr key={txn.id} className={`border-b border-color-border/20 transition-colors hover:bg-bg-elevated/40 ${i % 2 === 0 ? "" : "bg-bg-surface/30"}`}>
                        <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">
                          {new Date(txn.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary max-w-xs truncate">{txn.description}</td>
                        <td className={`px-5 py-3.5 font-heading font-bold tabular-nums ${isCredit ? "text-color-success" : "text-color-error"}`}>
                          {isCredit ? "+" : "-"}{formatGHS(Number(txn.amount))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
