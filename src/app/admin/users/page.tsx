import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Users" };

const PAGE_SIZE = 30;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const q    = searchParams.q?.trim();

  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, name: true, phone: true, email: true, role: true,
        walletBalance: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ROLE_COLOR: Record<string, string> = { USER: "#6b7280", RESELLER: "#9333ea", ADMIN: "#ef4444" };

  return (
    <div className="container-content py-10">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-8">Users</h1>

      <form method="get" action="/admin/users" className="flex gap-3 mb-6">
        <input name="q" defaultValue={q} placeholder="Search by name or phone…"
          className="flex-1 bg-bg-elevated border border-color-border rounded-input px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 transition-all text-sm" />
        <button type="submit" className="px-4 py-2.5 rounded-btn bg-accent-primary text-bg-base font-semibold text-sm">Search</button>
        {q && <Link href="/admin/users" className="px-4 py-2.5 rounded-btn border border-color-border text-text-secondary text-sm">Clear</Link>}
      </form>

      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Name", "Phone", "Email", "Role", "Orders", "Wallet", "Joined"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-text-primary">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary text-xs">{u.phone}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: (ROLE_COLOR[u.role] ?? "#888") + "22", color: ROLE_COLOR[u.role] ?? "#888" }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-primary">{u._count.orders}</td>
                  <td className="px-4 py-3 font-mono text-text-primary">{formatGHS(Number(u.walletBalance))}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString("en-GH")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-8 text-center text-text-muted text-sm">No users found.</p>}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-color-border/40">
            <p className="text-xs text-text-muted">Page {page} of {totalPages} · {total} users</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/admin/users?page=${page - 1}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs">← Prev</Link>}
              {page < totalPages && <Link href={`/admin/users?page=${page + 1}${q ? `&q=${q}` : ""}`} className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs">Next →</Link>}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
