"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS: Record<string, { label: string; color: string; next: string }[]> = {
  PENDING:           [{ label: "Mark Failed",   color: "#ef4444", next: "FAILED" }],
  PAYMENT_CONFIRMED: [{ label: "Mark Failed",   color: "#ef4444", next: "FAILED" }],
  PROCESSING:        [{ label: "Mark Delivered",color: "#10b981", next: "DELIVERED" }, { label: "Mark Failed", color: "#ef4444", next: "FAILED" }],
  DELIVERED:         [{ label: "Refund",        color: "#f59e0b", next: "REFUNDED" }],
  FAILED:            [{ label: "Refund",        color: "#f59e0b", next: "REFUNDED" }],
  REFUNDED:          [],
};

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const actions = ACTIONS[status] ?? [];
  if (!actions.length) return <span className="text-text-muted text-xs">—</span>;

  async function handleAction(next: string) {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      {actions.map((a) => (
        <button key={a.next} onClick={() => handleAction(a.next)} disabled={loading}
          className="px-2 py-1 rounded text-xs font-semibold disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: a.color + "22", color: a.color, border: `1px solid ${a.color}44` }}>
          {a.label}
        </button>
      ))}
    </div>
  );
}
