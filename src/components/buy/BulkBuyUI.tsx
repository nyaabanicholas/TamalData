"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { NetworkCard } from "@/components/ui/NetworkCard";
import { STATIC_BUNDLES } from "@/lib/staticBundles";
import type { Network, DataBundle } from "@/types";

const NETWORKS: Network[] = ["MTN", "TELECEL", "AIRTELTIGO"];
const GHANA_PHONE = /^0[2345][0-9]{8}$/;

interface Recipient {
  id: string;
  phone: string;
  bundle: DataBundle | null;
}

type SubmitResult = {
  success: boolean;
  batchReference?: string;
  results?: Array<{ phone: string; success: boolean; message?: string }>;
  error?: string;
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

export function BulkBuyUI() {
  const [network, setNetwork] = useState<Network | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([{ id: makeId(), phone: "", bundle: null }]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const bundles: DataBundle[] = network ? STATIC_BUNDLES[network] : [];

  const addRow = () => {
    if (recipients.length >= 50) return;
    setRecipients((prev) => [...prev, { id: makeId(), phone: "", bundle: null }]);
  };

  const removeRow = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const updatePhone = (id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, phone: value.replace(/\D/g, "").slice(0, 10) } : r))
    );
  };

  const updateBundle = (id: string, bundle: DataBundle) => {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, bundle } : r)));
  };

  const allValid = recipients.length > 0 &&
    recipients.every((r) => GHANA_PHONE.test(r.phone) && r.bundle !== null);

  const totalCost = recipients.reduce((sum, r) => sum + (r.bundle?.price ?? 0), 0);

  const handleSubmit = async () => {
    if (!network || !allValid || submitting) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/bulk-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          recipients: recipients.map((r) => ({
            phone: r.phone,
            bundleId: r.bundle!.id,
            bundleSize: r.bundle!.size,
            bundleValidity: r.bundle!.validity,
            costPrice: r.bundle!.price,
          })),
        }),
      });
      const data = (await res.json()) as SubmitResult;
      setResult(data);
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto py-8 text-center"
      >
        <div className="liquid-glass-strong rounded-3xl p-10 flex flex-col items-center gap-4">
          <CheckCircle className="h-14 w-14 text-color-success" />
          <h2 className="font-heading text-3xl text-text-primary">Batch Sent!</h2>
          <p className="text-text-secondary font-barlow text-sm">
            {recipients.length} bundle{recipients.length !== 1 ? "s" : ""} queued for delivery.
            Ref: <span className="font-mono text-accent-primary">{result.batchReference}</span>
          </p>
          {result.results && result.results.length > 0 && (
            <ul className="w-full mt-2 flex flex-col gap-2 text-sm font-barlow">
              {result.results.map((r) => (
                <li key={r.phone} className="flex items-center gap-3 liquid-glass rounded-xl px-4 py-2">
                  {r.success ? (
                    <CheckCircle className="h-4 w-4 text-color-success shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-color-error shrink-0" />
                  )}
                  <span className="text-text-primary font-mono">{r.phone}</span>
                  {r.message && <span className="text-text-muted ml-auto text-xs">{r.message}</span>}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => {
              setResult(null);
              setRecipients([{ id: makeId(), phone: "", bundle: null }]);
              setNetwork(null);
            }}
            className="mt-2 liquid-glass rounded-full px-6 py-2.5 text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors"
          >
            New Batch
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 flex flex-col gap-8">
      {/* Step 1: Network */}
      <section>
        <h2 className="font-heading text-2xl text-text-primary mb-4">Select Network</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NETWORKS.map((net) => (
            <NetworkCard
              key={net}
              network={net}
              selected={network === net}
              onSelect={(n) => { setNetwork(n); setRecipients([{ id: makeId(), phone: "", bundle: null }]); }}
              compact
            />
          ))}
        </div>
      </section>

      {/* Step 2: Recipients */}
      <AnimatePresence>
        {network && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl text-text-primary">Recipients</h2>
              <span className="text-sm text-text-muted font-barlow">{recipients.length}/50</span>
            </div>

            <div className="flex flex-col gap-3">
              {recipients.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  className="liquid-glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                >
                  <span className="text-text-muted text-sm font-barlow font-medium w-6 shrink-0">
                    {i + 1}.
                  </span>

                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="0XX XXX XXXX"
                    value={rec.phone}
                    onChange={(e) => updatePhone(rec.id, e.target.value)}
                    className="flex-1 min-w-0 rounded-xl bg-bg-elevated border border-color-border px-4 py-2 text-sm font-barlow text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all"
                  />

                  <select
                    value={rec.bundle?.id ?? ""}
                    onChange={(e) => {
                      const b = bundles.find((b) => b.id === e.target.value);
                      if (b) updateBundle(rec.id, b);
                    }}
                    className="flex-1 min-w-0 rounded-xl bg-bg-elevated border border-color-border px-4 py-2 text-sm font-barlow text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all"
                  >
                    <option value="">Select bundle</option>
                    {bundles.filter((b) => b.available).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.size} — GH₵{b.price.toFixed(2)}
                      </option>
                    ))}
                  </select>

                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(rec.id)}
                      className="liquid-glass h-9 w-9 rounded-full flex items-center justify-center text-text-muted hover:text-color-error transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              disabled={recipients.length >= 50}
              className="mt-3 liquid-glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium font-barlow text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add number
            </button>

            {/* Summary + Pay */}
            {recipients.some((r) => r.bundle) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 liquid-glass-strong rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-text-secondary font-barlow uppercase tracking-wider">
                    Total for {recipients.filter((r) => r.bundle).length} number{recipients.filter((r) => r.bundle).length !== 1 ? "s" : ""}
                  </p>
                  <p className="font-heading text-3xl text-text-primary mt-1">
                    GH₵{totalCost.toFixed(2)}
                  </p>
                </div>

                {result?.error && (
                  <p className="text-sm text-color-error font-barlow">{result.error}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allValid || submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Send to ${recipients.length} number${recipients.length !== 1 ? "s" : ""} →`
                  )}
                </button>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
