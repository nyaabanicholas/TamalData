"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { STATIC_BUNDLES } from "@/lib/staticBundles";
import type { Network } from "@/types";

const NETWORKS: Network[] = ["MTN", "TELECEL", "AIRTELTIGO"];
const NETWORK_COLOR: Record<string, string> = {
  MTN: "#FFCB00", TELECEL: "#E30613", AIRTELTIGO: "#9333EA",
};

// Reseller markup is 8%, retail is 15%
const RESELLER_MARKUP = 0.08;
const RETAIL_MARKUP   = 0.15;

function applyMarkup(cost: number, markup: number) {
  return Math.ceil(cost * (1 + markup) * 100) / 100;
}

export default function ResellerPricingPage() {
  const [activeNet, setActiveNet] = useState<Network>("MTN");
  const [sellPrice, setSellPrice] = useState("");

  const bundles = STATIC_BUNDLES[activeNet];
  const color   = NETWORK_COLOR[activeNet];

  // Profit calculator
  const costBase  = bundles[0]?.price ?? 4.60;
  const resCost   = applyMarkup(costBase, RESELLER_MARKUP);
  const customSell = parseFloat(sellPrice) || 0;
  const margin    = customSell > 0 ? ((customSell - resCost) / customSell * 100).toFixed(1) : null;

  return (
    <div className="container-content pt-4 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-text-primary">Pricing</h1>
          <p className="text-text-secondary mt-1">Your cost vs. retail price. Pocket the difference.</p>
        </div>
        <div className="flex gap-2">
          {NETWORKS.map((net) => (
            <button key={net} onClick={() => setActiveNet(net)}
              className="px-4 py-2 rounded-btn text-sm font-semibold transition-all"
              style={activeNet === net
                ? { backgroundColor: NETWORK_COLOR[net], color: net === "MTN" ? "#1A1200" : "#fff" }
                : { border: "1px solid var(--color-border)", color: "var(--text-secondary)" }}>
              {net === "AIRTELTIGO" ? "AirtelTigo" : net}
            </button>
          ))}
        </div>
      </div>

      {/* Profit calculator */}
      <GlassPanel className="p-6 mb-8">
        <h2 className="font-display font-bold text-lg text-text-primary mb-4">Profit Calculator</h2>
        <div className="grid sm:grid-cols-3 gap-6 items-end">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Bundle (example: 1st bundle)</label>
            <div className="p-3 rounded-input bg-bg-elevated border border-color-border">
              <p className="font-mono font-bold text-text-primary">{bundles[0]?.size}</p>
              <p className="text-xs text-text-muted mt-0.5">Your cost: <span className="font-semibold" style={{ color }}>GH₵{resCost.toFixed(2)}</span></p>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Your Sell Price (GH₵)</label>
            <input
              type="number"
              step="0.50"
              min={resCost}
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder={`e.g. ${(resCost * 1.15).toFixed(2)}`}
              className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 transition-all"
            />
          </div>
          <div className="p-4 rounded-input border" style={{ borderColor: customSell > resCost ? "var(--color-success)" : "var(--color-border)", backgroundColor: customSell > resCost ? "rgba(16,185,129,0.06)" : "transparent" }}>
            <p className="text-xs text-text-muted mb-1">Your Profit</p>
            {customSell > resCost ? (
              <>
                <p className="font-display font-bold text-2xl text-color-success">+GH₵{(customSell - resCost).toFixed(2)}</p>
                <p className="text-xs text-text-muted mt-1">Margin: {margin}%</p>
              </>
            ) : (
              <p className="text-text-muted text-sm">Enter a sell price above cost</p>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Price comparison table */}
      <GlassPanel className="overflow-hidden">
        <div className="px-4 py-3 border-b border-color-border/40 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <h2 className="font-display font-semibold text-text-primary">{activeNet} Bundle Pricing</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-color-border/40">
                {["Bundle", "Your Cost (8%)", "Retail Price (15%)", "Your Edge", "Validity"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bundles.map((b, i) => {
                const resCost = applyMarkup(b.price, RESELLER_MARKUP);
                const retail  = applyMarkup(b.price, RETAIL_MARKUP);
                const edge    = retail - resCost;
                return (
                  <tr key={b.id} className={`border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors ${i === 0 ? "bg-bg-elevated/20" : ""}`}>
                    <td className="px-4 py-3">
                      <span className="font-display font-bold text-text-primary">{b.size}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color }}>GH₵{resCost.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-text-secondary">GH₵{retail.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="text-color-success font-semibold">+GH₵{edge.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{b.validity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <p className="text-xs text-text-muted mt-4 text-center">
        Your 8% markup tier saves you up to 7% vs. retail on every bundle you sell.
      </p>
    </div>
  );
}
