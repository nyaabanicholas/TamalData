import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatGHS } from "@/lib/utils";
import { AdminWalletAdjust } from "./WalletAdjust";
import Link from "next/link";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — User Detail" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, phone: true, email: true,
      role: true, resellerStatus: true, walletBalance: true,
      referralCode: true, createdAt: true,
      _count: { select: { orders: true, referrals: true } },
    },
  });

  if (!user) return <div className="p-8 text-center text-text-muted">User not found</div>;

  const [orders, txns, payouts] = await Promise.all([
    prisma.order.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.walletTransaction.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.payoutRequest.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalSpent = txns
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalCredited = txns
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="container-content py-10">
      <Link href="/admin/users" className="text-text-muted hover:text-text-primary text-sm transition-colors mb-6 inline-block">
        ← Back to Users
      </Link>

      {/* User info header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-text-primary mb-1">{user.name}</h1>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="font-mono">{user.phone}</span>
            {user.email && <span>· {user.email}</span>}
            <span>· Ref: {user.referralCode}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            user.role === "ADMIN" ? "bg-red-500/10 text-red-500" :
            user.role === "RESELLER" ? "bg-purple-500/10 text-purple-500" :
            "bg-gray-500/10 text-gray-500"
          }`}>
            {user.role}
          </span>
          {user.resellerStatus && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.resellerStatus === "APPROVED" ? "bg-green-500/10 text-green-500" :
              user.resellerStatus === "PENDING_APPROVAL" ? "bg-yellow-500/10 text-yellow-500" :
              "bg-red-500/10 text-red-500"
            }`}>
              {user.resellerStatus}
            </span>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Wallet Balance</p>
          <p className="font-display font-bold text-xl text-accent-primary">{formatGHS(Number(user.walletBalance))}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total Spent</p>
          <p className="font-display font-bold text-xl text-color-error">{formatGHS(totalSpent)}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total Credited</p>
          <p className="font-display font-bold text-xl text-color-success">{formatGHS(totalCredited)}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Orders</p>
          <p className="font-display font-bold text-xl text-text-primary">{user._count.orders}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Referrals</p>
          <p className="font-display font-bold text-xl text-text-primary">{user._count.referrals}</p>
        </GlassPanel>
      </div>

      {/* Wallet adjustment (admin only) */}
      <GlassPanel className="p-5 mb-8">
        <h2 className="font-display font-semibold text-text-primary mb-3">Wallet Adjustment</h2>
        <AdminWalletAdjust userId={user.id} />
      </GlassPanel>

      {/* Recent orders */}
      <GlassPanel className="overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-color-border/40">
          <h2 className="font-display font-semibold text-text-primary">Recent Orders ({orders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Date", "Ref", "Network", "Bundle", "Recipient", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-text-muted font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-2 text-text-muted text-xs">{new Date(o.createdAt).toLocaleDateString("en-GH")}</td>
                  <td className="px-4 py-2 font-mono text-xs text-accent-primary">{o.reference.slice(0, 16)}…</td>
                  <td className="px-4 py-2 font-semibold text-text-primary text-xs">{o.network}</td>
                  <td className="px-4 py-2 text-text-secondary text-xs">{o.bundleSize}</td>
                  <td className="px-4 py-2 font-mono text-text-secondary text-xs">{o.recipientPhone}</td>
                  <td className="px-4 py-2 font-mono text-text-primary text-xs">{formatGHS(Number(o.sellPrice))}</td>
                  <td className="px-4 py-2"><StatusBadge status={o.status as OrderStatus} /></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-text-muted text-xs">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Wallet transactions */}
      <GlassPanel className="overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-color-border/40">
          <h2 className="font-display font-semibold text-text-primary">Wallet History ({txns.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Date", "Type", "Amount", "Description"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-text-muted font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-2 text-text-muted text-xs">{new Date(t.createdAt).toLocaleDateString("en-GH")}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.type === "CREDIT" ? "text-green-500 bg-green-500/10" :
                      t.type === "DEBIT" ? "text-red-500 bg-red-500/10" :
                      t.type === "COMMISSION" ? "text-blue-500 bg-blue-500/10" :
                      "text-orange-500 bg-orange-500/10"
                    }`}>{t.type}</span>
                  </td>
                  <td className={`px-4 py-2 font-mono text-xs ${
                    t.type === "CREDIT" || t.type === "COMMISSION" ? "text-color-success" : "text-color-error"
                  }`}>
                    {t.type === "CREDIT" || t.type === "COMMISSION" ? "+" : "-"}{formatGHS(Number(t.amount))}
                  </td>
                  <td className="px-4 py-2 text-text-secondary text-xs">{t.description}</td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-text-muted text-xs">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Payout requests */}
      <GlassPanel className="overflow-hidden">
        <div className="px-4 py-3 border-b border-color-border/40">
          <h2 className="font-display font-semibold text-text-primary">Payout Requests ({payouts.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Date", "Amount", "MoMo", "Status", "Note"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-text-muted font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-2 text-text-muted text-xs">{new Date(p.createdAt).toLocaleDateString("en-GH")}</td>
                  <td className="px-4 py-2 font-mono text-text-primary text-xs">{formatGHS(Number(p.amount))}</td>
                  <td className="px-4 py-2 font-mono text-text-secondary text-xs">{p.momoPhone} ({p.momoNetwork})</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.status === "PAID" ? "text-green-500 bg-green-500/10" :
                      p.status === "APPROVED" ? "text-blue-500 bg-blue-500/10" :
                      p.status === "REJECTED" ? "text-red-500 bg-red-500/10" :
                      "text-yellow-500 bg-yellow-500/10"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-2 text-text-secondary text-xs">{p.adminNote ?? p.note ?? "—"}</td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-text-muted text-xs">No payouts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
