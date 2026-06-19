"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus } from "@/types";
import { formatGHS } from "@/lib/utils";

interface Order {
  id: string;
  reference: string;
  network: string;
  bundleSize: string;
  sellPrice: number | string;
  status: OrderStatus;
  createdAt: Date | string;
  recipientPhone: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="liquid-glass rounded-2xl p-12 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-medium text-text-secondary">No orders yet</p>
        <p className="text-sm text-text-muted mt-1 mb-6">Your orders will appear here.</p>
        <Link
          href="/buy"
          className="inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--gradient-cta)" }}
        >
          Buy Your First Bundle
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="liquid-glass rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-color-border/30">
        <h2 className="font-heading text-base text-text-primary">Recent Orders</h2>
        <Link href="/dashboard/orders" className="text-xs text-accent-primary hover:underline font-barlow">
          View all →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-color-border/20">
              {["Ref", "Network", "Bundle", "Phone", "Amount", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr
                key={o.id}
                className={`border-b border-color-border/10 transition-colors hover:bg-bg-elevated/40 ${i % 2 === 1 ? "bg-bg-surface/20" : ""}`}
              >
                <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{o.reference.slice(-8)}</td>
                <td className="px-4 py-3 font-semibold text-text-primary">{o.network}</td>
                <td className="px-4 py-3 text-text-secondary">{o.bundleSize}</td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs">{o.recipientPhone}</td>
                <td className="px-4 py-3 font-heading text-text-primary tabular-nums">{formatGHS(Number(o.sellPrice))}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
