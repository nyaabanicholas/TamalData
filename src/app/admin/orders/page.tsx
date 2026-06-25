import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatGHS } from "@/lib/utils";
import { OrderActions } from "./OrderActions";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: { status?: string; network?: string; page?: string };
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 25;
  const where = {
    ...(searchParams.status ? { status: searchParams.status as never } : {}),
    ...(searchParams.network ? { network: searchParams.network as never } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-bg-base p-8">
      <div className="max-w-content mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin" className="text-text-muted hover:text-text-primary text-sm transition-colors">
            ← Dashboard
          </a>
          <h1 className="font-display font-bold text-3xl text-text-primary">
            Orders
          </h1>
          <span className="text-text-muted text-sm ml-auto">{total} total</span>
        </div>

        <GlassPanel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-color-border">
                  <th className="text-left py-2 pr-4 font-medium">Reference</th>
                  <th className="text-left py-2 pr-4 font-medium">Network</th>
                  <th className="text-left py-2 pr-4 font-medium">Bundle</th>
                  <th className="text-left py-2 pr-4 font-medium">Recipient</th>
                  <th className="text-left py-2 pr-4 font-medium">Amount</th>
                  <th className="text-left py-2 pr-4 font-medium">Status</th>
                  <th className="text-left py-2 pr-4 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-color-border/40 hover:bg-bg-elevated/30 transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono text-xs text-text-secondary">
                      {order.reference}
                    </td>
                    <td className="py-3 pr-4 text-text-primary">{order.network}</td>
                    <td className="py-3 pr-4 text-text-primary">{order.bundleSize}</td>
                    <td className="py-3 pr-4 font-mono text-text-secondary">
                      {order.recipientPhone}
                    </td>
                    <td className="py-3 pr-4 font-mono text-text-primary">
                      {formatGHS(Number(order.sellPrice))}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="py-3 text-text-muted text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-GH")}
                    </td>
                    <td className="py-3">
                      <OrderActions orderId={order.id} status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-color-border">
              <span className="text-xs text-text-muted">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`?page=${page - 1}`}
                    className="px-3 py-1 text-xs border border-color-border rounded-btn text-text-secondary hover:border-accent-primary transition-colors"
                  >
                    Previous
                  </a>
                )}
                {page < Math.ceil(total / limit) && (
                  <a
                    href={`?page=${page + 1}`}
                    className="px-3 py-1 text-xs border border-color-border rounded-btn text-text-secondary hover:border-accent-primary transition-colors"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
