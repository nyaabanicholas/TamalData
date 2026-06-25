import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GlassPanel } from "@/components/ui/GlassPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order History" };

const PAGE_SIZE = 20;

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; network?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/dashboard/orders");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const status = searchParams.status;
  const network = searchParams.network;

  const where = {
    userId: session.user.id,
    ...(status ? { status: status as never } : {}),
    ...(network ? { network: network as never } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content pt-28 pb-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-text-muted hover:text-text-primary text-sm transition-colors">
            ← Dashboard
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary text-sm font-medium">Order History</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-text-primary">Order History</h1>
            <p className="text-text-muted text-sm mt-1">{total} total orders</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {["", "PENDING", "DELIVERED", "FAILED"].map((s) => (
              <Link
                key={s || "all"}
                href={`/dashboard/orders?${s ? `status=${s}&` : ""}${network ? `network=${network}` : ""}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  (status ?? "") === s
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "border-color-border text-text-secondary hover:border-accent-primary/50"
                }`}
              >
                {s || "All"}
              </Link>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <GlassPanel className="p-16 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-semibold text-text-secondary text-lg">No orders found</p>
            <p className="text-sm text-text-muted mt-2">
              {status ? `No ${status.toLowerCase()} orders yet.` : "You haven't placed any orders yet."}
            </p>
            <Link href="/buy" className="inline-block mt-6 px-6 py-2.5 bg-cta-gradient text-white rounded-btn font-semibold text-sm shadow-glow-sm hover:shadow-glow transition-all">
              Buy Data Now
            </Link>
          </GlassPanel>
        ) : (
          <GlassPanel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-color-border/40">
                    {["Date", "Reference", "Network", "Bundle", "Recipient", "Amount", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors">
                      <td className="px-4 py-3.5 text-text-muted text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-GH")}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-text-muted whitespace-nowrap">
                        {order.reference}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-text-primary">{order.network}</td>
                      <td className="px-4 py-3.5 text-text-secondary">{order.bundleSize}</td>
                      <td className="px-4 py-3.5 font-mono text-text-secondary">{order.recipientPhone}</td>
                      <td className="px-4 py-3.5 font-semibold text-text-primary whitespace-nowrap">
                        {formatGHS(Number(order.sellPrice))}
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/dashboard/orders/${order.reference}`}
                          className="text-xs text-accent-primary hover:underline whitespace-nowrap"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-color-border/40">
                <p className="text-xs text-text-muted">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/dashboard/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
                      className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs hover:border-accent-primary/50 transition-colors"
                    >
                      ← Prev
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/dashboard/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
                      className="px-3 py-1.5 rounded-btn border border-color-border text-text-secondary text-xs hover:border-accent-primary/50 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </GlassPanel>
        )}
      </div>
    </main>
  );
}
