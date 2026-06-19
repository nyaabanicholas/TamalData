"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { isValidGhanaPhone, detectNetworkFromPhone, maskPhone } from "@/lib/utils";
import { Plus, Trash2, Phone } from "lucide-react";
import type { SavedNumber } from "@prisma/client";
import { useRouter } from "next/navigation";

const NETWORK_COLOR: Record<string, string> = {
  MTN: "#FFCB00",
  TELECEL: "#E30613",
  AIRTELTIGO: "#9333EA",
};

export function SavedNumbersClient({ initialNumbers }: { initialNumbers: SavedNumber[] }) {
  const router = useRouter();
  const [numbers, setNumbers] = useState(initialNumbers);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const detectedNetwork = phone.length >= 3 ? detectNetworkFromPhone(phone) : null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/\s/g, "");
    if (!isValidGhanaPhone(cleaned)) {
      setError("Enter a valid Ghana mobile number");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/saved-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, label: label.trim() || undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save number");
        return;
      }
      const saved: SavedNumber = await res.json();
      setNumbers((prev) => [saved, ...prev]);
      setLabel("");
      setPhone("");
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/dashboard/saved-numbers/${id}`, { method: "DELETE" });
      setNumbers((prev) => prev.filter((n) => n.id !== id));
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <GlowButton
          variant={showForm ? "ghost" : "primary"}
          size="sm"
          onClick={() => { setShowForm(!showForm); setError(""); }}
        >
          {showForm ? "Cancel" : (
            <span className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Number</span>
          )}
        </GlowButton>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassPanel className="p-6">
              <h3 className="font-display font-bold text-text-primary mb-4">Add New Number</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium uppercase tracking-wide">
                    Label (optional)
                  </label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Dad, Sister, Work"
                    className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium uppercase tracking-wide">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0244 123 456"
                      type="tel"
                      className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-2.5 font-mono text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/30 transition-all"
                    />
                    {detectedNetwork && (
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: detectedNetwork === "MTN" ? "#1A1200" : "#fff",
                          backgroundColor: NETWORK_COLOR[detectedNetwork] ?? "var(--accent-primary)",
                        }}
                      >
                        {detectedNetwork}
                      </span>
                    )}
                  </div>
                  {error && <p className="text-xs text-color-error mt-1.5">{error}</p>}
                </div>
                <GlowButton type="submit" loading={saving}>
                  Save Number
                </GlowButton>
              </form>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Numbers list */}
      {numbers.length === 0 && !showForm ? (
        <GlassPanel className="p-12 text-center">
          <Phone className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="font-medium text-text-secondary">No saved numbers yet</p>
          <p className="text-sm text-text-muted mt-1">Add numbers for quick checkout access.</p>
        </GlassPanel>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {numbers.map((n) => {
              const net = detectNetworkFromPhone(n.phone);
              const color = net ? NETWORK_COLOR[net] : "var(--accent-primary)";
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <GlassPanel className="p-4 flex items-center gap-4">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ backgroundColor: color, color: net === "MTN" ? "#1A1200" : "#fff" }}
                    >
                      {net ? net.slice(0, 2) : "📱"}
                    </div>
                    <div className="flex-1 min-w-0">
                      {n.label && (
                        <p className="text-xs text-text-muted font-medium mb-0.5">{n.label}</p>
                      )}
                      <p className="font-mono font-semibold text-text-primary">{maskPhone(n.phone)}</p>
                      {net && <p className="text-xs text-text-muted mt-0.5">{net}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/buy?phone=${n.phone}`}>
                        <button className="text-xs text-accent-primary hover:underline font-medium whitespace-nowrap">
                          Buy →
                        </button>
                      </a>
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deleting === n.id}
                        className="text-text-muted hover:text-color-error transition-colors p-1 disabled:opacity-40"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

