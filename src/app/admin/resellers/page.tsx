import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ResellerActions } from "./ResellerActions";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Resellers" };

const STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: "#f59e0b",
  APPROVED:         "#10b981",
  SUSPENDED:        "#ef4444",
};

export default async function AdminResellersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  const status = searchParams.status;

  const resellers = await prisma.user.findMany({
    where: {
      role: "RESELLER",
      ...(status ? { resellerStatus: status as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      resellerStatus: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const counts = await prisma.user.groupBy({
    by: ["resellerStatus"],
    where: { role: "RESELLER" },
    _count: true,
  });

  const countMap = Object.fromEntries(counts.map((c) => [c.resellerStatus, c._count]));

  return (
    <div className="container-content py-10">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-8">Resellers</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {[["", "All"], ["PENDING_APPROVAL", "Pending"], ["APPROVED", "Approved"], ["SUSPENDED", "Suspended"]].map(([s, label]) => (
          <Link key={s || "all"} href={`/admin/resellers${s ? `?status=${s}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${(status ?? "") === s ? "bg-accent-primary text-white border-accent-primary" : "border-color-border text-text-secondary"}`}>
            {label} {s && countMap[s] ? `(${countMap[s]})` : ""}
          </Link>
        ))}
      </div>

      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Name", "Phone", "Email", "Orders", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resellers.map((r) => (
                <tr key={r.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-text-primary">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary text-xs">{r.phone}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{r.email ?? "—"}</td>
                  <td className="px-4 py-3 text-text-primary">{r._count.orders}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: (STATUS_COLORS[r.resellerStatus ?? ""] ?? "#888") + "22", color: STATUS_COLORS[r.resellerStatus ?? ""] ?? "#888" }}>
                      {r.resellerStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">{new Date(r.createdAt).toLocaleDateString("en-GH")}</td>
                  <td className="px-4 py-3"><ResellerActions userId={r.id} status={r.resellerStatus ?? ""} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {resellers.length === 0 && <p className="p-8 text-center text-text-muted text-sm">No resellers found.</p>}
        </div>
      </GlassPanel>
    </div>
  );
}
