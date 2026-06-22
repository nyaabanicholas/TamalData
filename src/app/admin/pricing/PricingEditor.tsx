"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { useRouter } from "next/navigation";
import type { DataBundle } from "@/types";
import { applyMarkup } from "@/lib/markup";

interface GlobalConfig {
  id: string;
  label: string | null;
  markupPercent: number;
  isGlobal: boolean;
  isResellerTier: boolean;
  network: string | null;
  bundleId: string | null;
}

interface BundleRow extends DataBundle {
  sellPrice: number;
}

interface Props {
  globalConfigs: GlobalConfig[];
  bundles: BundleRow[];
  globalRetailMarkup: number;
}

const NETWORKS = ["MTN", "TELECEL", "AIRTELTIGO"] as const;
type NetworkTab = typeof NETWORKS[number];

const NET_COLOR: Record<NetworkTab, string> = {
  MTN: "#f59e0b",
  TELECEL: "#ef4444",
  AIRTELTIGO: "#3b82f6",
};

export function PricingEditor({ globalConfigs, bundles, globalRetailMarkup }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<NetworkTab>("MTN");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  // Global tier markups
  const [globalValues, setGlobalValues] = useState<Record<string, number>>(
    Object.fromEntries(globalConfigs.map((c) => [c.id, c.markupPercent]))
  );

  // Per-bundle sell prices keyed by bundleId
  const [sellPrices, setSellPrices] = useState<Record<string, number>>(
    Object.fromEntries(bundles.map((b) => [b.id, b.sellPrice]))
  );

  function margin(bundleId: string, costPrice: number) {
    const sell = sellPrices[bundleId] ?? costPrice;
    return (((sell - costPrice) / costPrice) * 100).toFixed(1);
  }

  function resetToGlobal(bundleId: string, costPrice: number) {
    setSellPrices((prev) => ({
      ...prev,
      [bundleId]: applyMarkup(costPrice, globalRetailMarkup / 100),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configs: globalConfigs.map((c) => ({ id: c.id, markupPercent: globalValues[c.id] })),
          bundles: bundles.map((b) => ({
            bundleId:  b.id,
            network:   b.network,
            costPrice: b.price,
            sellPrice: sellPrices[b.id] ?? b.sellPrice,
          })),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Save failed");
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetMarkup() {
    if (!confirm("Delete all retail PricingConfig overrides? Prices will revert to static bundle rates (no markup).")) return;
    setResetting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reset-pricing", { method: "POST" });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Reset failed"); }
      else { router.refresh(); }
    } catch { setError("Network error"); }
    finally { setResetting(false); }
  }

  const tabBundles = bundles.filter((b) => b.network === tab);

  return (
    <div className="space-y-6">
      {/* Global markup tiers */}
      <GlassPanel className="p-6">
        <h2 className="font-display font-semibold text-text-primary mb-1">Global Markup Tiers</h2>
        <p className="text-xs text-text-muted mb-4">
          Applied when no per-bundle price is set. Per-bundle prices below take priority.
        </p>
        <div className="flex flex-wrap gap-6">
          {globalConfigs.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-sm text-text-secondary font-medium w-36">
                {c.label ?? (c.isResellerTier ? "Reseller markup" : "Retail markup")}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={500}
                  step={0.5}
                  value={globalValues[c.id]}
                  onChange={(e) =>
                    setGlobalValues((prev) => ({ ...prev, [c.id]: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-20 bg-bg-elevated border border-color-border rounded-input px-3 py-1.5 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-right"
                />
                <span className="text-text-muted text-sm">%</span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Per-bundle pricing */}
      <GlassPanel className="p-6">
        <h2 className="font-display font-semibold text-text-primary mb-1">Per-Bundle Sell Prices</h2>
        <p className="text-xs text-text-muted mb-5">
          These are the exact prices customers see and pay. Margin % updates live as you type.
        </p>

        {/* Network tabs */}
        <div className="flex gap-1 mb-6 border-b border-color-border/40 pb-0">
          {NETWORKS.map((net) => (
            <button
              key={net}
              onClick={() => setTab(net)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
                tab === net
                  ? "border-current text-white"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
              style={tab === net ? { color: NET_COLOR[net], borderColor: NET_COLOR[net] } : {}}
            >
              {net}
            </button>
          ))}
        </div>

        {/* Bundle table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted border-b border-color-border/40">
                <th className="text-left py-2 pr-4 font-medium">Bundle</th>
                <th className="text-left py-2 pr-4 font-medium">Validity</th>
                <th className="text-right py-2 pr-4 font-medium">Cost (GH₵)</th>
                <th className="text-right py-2 pr-4 font-medium w-36">Sell Price (GH₵)</th>
                <th className="text-right py-2 pr-4 font-medium">Margin</th>
                <th className="text-right py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tabBundles.map((b) => {
                const m = parseFloat(margin(b.id, b.price));
                return (
                  <tr
                    key={b.id}
                    className="border-b border-color-border/20 last:border-0 hover:bg-bg-elevated/20 transition-colors"
                  >
                    <td className="py-3 pr-4 font-semibold text-text-primary">{b.size}</td>
                    <td className="py-3 pr-4 text-text-muted text-xs">{b.validity}</td>
                    <td className="py-3 pr-4 font-mono text-text-muted text-right">{b.price.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        min={b.price}
                        step={0.5}
                        value={sellPrices[b.id] ?? b.sellPrice}
                        onChange={(e) =>
                          setSellPrices((prev) => ({
                            ...prev,
                            [b.id]: parseFloat(e.target.value) || b.price,
                          }))
                        }
                        className="w-full bg-bg-elevated border border-color-border rounded-input px-3 py-1.5 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-right"
                      />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span
                        className={`text-xs font-semibold font-mono ${
                          m < 0 ? "text-color-error" : m < 5 ? "text-color-warning" : "text-color-success"
                        }`}
                      >
                        {m >= 0 ? "+" : ""}{m}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => resetToGlobal(b.id, b.price)}
                        className="text-[10px] text-text-muted hover:text-text-secondary transition-colors whitespace-nowrap"
                        title="Reset to global markup"
                      >
                        reset
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {error && <p className="text-color-error text-sm">{error}</p>}

      <div className="flex gap-3">
        <GlowButton onClick={handleSave} disabled={saving || resetting} className="flex-1">
          {saving ? "Saving…" : saved ? "Saved!" : "Save All Prices"}
        </GlowButton>
        <button
          onClick={handleResetMarkup}
          disabled={resetting || saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-color-error border border-color-error/30 hover:bg-color-error/10 transition-all disabled:opacity-50"
        >
          {resetting ? "Resetting…" : "Reset to No Markup"}
        </button>
      </div>
    </div>
  );
}
