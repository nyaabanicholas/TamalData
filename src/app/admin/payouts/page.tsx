import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";
import { AdminPayoutActions } from "./PayoutActions";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Payouts" };

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/auth/login");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 25;
  const statusFilter = searchParams.status;

  const where = {
    ...(statusFilter ? { status: statusFilter as never } : {}),
  };

  const [payouts, total, counts] = await Promise.all([
    prisma.payoutRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, phone: true, walletBalance: true } },
      },
    }),
    prisma.payoutRequest.count({ where }),
    prisma.payoutRequest.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const totalPages = Math.ceil(total / limit);

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "#f59e0b",
    APPROVED: "#3b82f6",
    PAID: "#10b981",
    REJECTED: "#ef4444",
  };

  return (
    <div className="container-content py-10">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-8">Payout Requests</h1>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[["", "All"], ["PENDING", "Pending"], ["APPROVED", "Approved"], ["PAID", "Paid"], ["REJECTED", "Rejected"]].map(([s, label]) => (
          <Link key={s || "all"} href={`/admin/payouts${s ? `?status=${s}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              (statusFilter ?? "") === s
                ? "bg-accent-primary text-white border-accent-primary"
                : "border-color-border text-text-secondary"
            }`}>
            {label} {s && countMap[s] ? `(${countMap[s]})` : ""}
          </Link>
        ))}
      </div>

      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Date", "User", "Phone", "Amount", "MoMo", "Wallet", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("en-GH")}
                    <br />
                    <span className="text-[10px]">{new Date(p.createdAt).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-text-primary">{p.user.name}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary text-xs">{p.user.phone}</td>
                  <td className="px-4 py-3 font-mono text-text-primary font-semibold">{formatGHS(Number(p.amount))}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-text-secondary">{p.momoPhone}</span>
                    <br />
                    <span className="text-[10px] text-text-muted">{p.momoNetwork}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary text-xs">
                    {formatGHS(Number(p.user.walletBalance))}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: (STATUS_COLORS[p.status] ?? "#888") + "22", color: STATUS_COLORS[p.status] ?? "#888" }}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminPayoutActions payoutId={p.id} status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payouts.length === 0 && (
            <p className="p-8 text-center text-text-muted text-sm">No payout requests found.</p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-color-border/40">
            <p className="text-xs text-text-muted">Page {page} of {totalPages} · {total} requests</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/payouts?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                  className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs">← Prev</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/payouts?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                  className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs">Next →</Link>
              )}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
