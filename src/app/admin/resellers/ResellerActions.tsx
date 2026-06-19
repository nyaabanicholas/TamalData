"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NEXT_ACTIONS: Record<string, { label: string; color: string; status: string }[]> = {
  PENDING_APPROVAL: [
    { label: "Approve", color: "#10b981", status: "APPROVED"   },
    { label: "Reject",  color: "#ef4444", status: "SUSPENDED"  },
  ],
  APPROVED: [
    { label: "Suspend", color: "#ef4444", status: "SUSPENDED"  },
  ],
  SUSPENDED: [
    { label: "Reinstate", color: "#10b981", status: "APPROVED" },
  ],
};

export function ResellerActions({ userId, status }: { userId: string; status: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const actions = NEXT_ACTIONS[status] ?? [];
  if (!actions.length) return <span className="text-text-muted text-xs">—</span>;

  async function handle(nextStatus: string) {
    setLoading(true);
    await fetch(`/api/admin/resellers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      {actions.map((a) => (
        <button key={a.status} onClick={() => handle(a.status)} disabled={loading}
          className="px-2 py-1 rounded text-xs font-semibold disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: a.color + "22", color: a.color, border: `1px solid ${a.color}44` }}>
          {a.label}
        </button>
      ))}
    </div>
  );
}
