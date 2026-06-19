"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminWalletAdjust({ userId }: { userId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description) return;

    setSaving(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: Number(amount),
          type,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ success: false, message: data.error ?? "Failed" });
      } else {
        setResult({ success: true, message: `Done! New balance: GH₵${data.newBalance.toFixed(2)}` });
        setAmount("");
        setDescription("");
        router.refresh();
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
      <div>
        <label className="text-[10px] font-barlow font-semibold text-text-muted uppercase tracking-wider block mb-1">Amount</label>
        <input
          type="number"
          min={1}
          step={0.01}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-28 bg-bg-elevated border border-color-border rounded-xl px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
        />
      </div>
      <div>
        <label className="text-[10px] font-barlow font-semibold text-text-muted uppercase tracking-wider block mb-1">Type</label>
        <div className="flex gap-1">
          {(["CREDIT", "DEBIT"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === t
                  ? t === "CREDIT"
                    ? "bg-color-success/20 text-color-success ring-2 ring-color-success/50"
                    : "bg-color-error/20 text-color-error ring-2 ring-color-error/50"
                  : "bg-bg-elevated text-text-muted border border-color-border"
              }`}
            >
              {t === "CREDIT" ? "+ Credit" : "- Debit"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="text-[10px] font-barlow font-semibold text-text-muted uppercase tracking-wider block mb-1">Reason</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Support refund, promo bonus..."
          className="w-full bg-bg-elevated border border-color-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
        />
      </div>
      <button
        type="submit"
        disabled={!amount || !description || saving}
        className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
        style={{ background: "var(--gradient-cta)" }}
      >
        {saving ? "Processing..." : type === "CREDIT" ? "Add Funds" : "Deduct"}
      </button>
      {result && (
        <p className={`text-xs font-barlow ${result.success ? "text-color-success" : "text-color-error"}`}>
          {result.message}
        </p>
      )}
    </form>
  );
}
