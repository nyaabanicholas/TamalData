"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS: Record<string, { label: string; color: string; action: string }[]> = {
  PENDING: [
    { label: "Approve", color: "#3b82f6", action: "APPROVE" },
    { label: "Reject", color: "#ef4444", action: "REJECT" },
  ],
  APPROVED: [
    { label: "Mark Paid", color: "#10b981", action: "PAY" },
    { label: "Reject", color: "#ef4444", action: "REJECT" },
  ],
  PAID: [],
  REJECTED: [],
};

export function AdminPayoutActions({ payoutId, status }: { payoutId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const actions = ACTIONS[status] ?? [];
  if (!actions.length) return <span className="text-text-muted text-xs">—</span>;

  async function handle(action: string) {
    if (action === "REJECT" && !showNote) {
      setShowNote(true);
      return;
    }
    setLoading(true);
    await fetch(`/api/admin/resellers/payout/${payoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNote: note || undefined }),
    });
    router.refresh();
    setLoading(false);
    setShowNote(false);
    setNote("");
  }

  return (
    <div className="flex flex-col gap-1">
      {showNote && (
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Admin note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-24 bg-bg-elevated border border-color-border rounded px-1.5 py-0.5 text-[10px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button onClick={() => handle("REJECT")} disabled={loading}
            className="px-1.5 py-0.5 rounded text-[10px] font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
            OK
          </button>
        </div>
      )}
      <div className="flex gap-1">
        {actions.map((a) => (
          <button key={a.action} onClick={() => handle(a.action)} disabled={loading}
            className="px-2 py-1 rounded text-xs font-semibold disabled:opacity-50 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: a.color + "22", color: a.color, border: `1px solid ${a.color}44` }}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
