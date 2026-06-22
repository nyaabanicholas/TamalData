"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { Coins } from "lucide-react";
import { STATIC_BUNDLES } from "@/lib/staticBundles";
import type { Network } from "@/types";

const NETWORKS: Network[] = ["MTN", "TELECEL", "AIRTELTIGO"];
const NETWORK_COLORS: Record<Network, string> = {
  MTN: "#FFCB00",
  TELECEL: "#E30613",
  AIRTELTIGO: "#9333EA",
};

interface BundleConfigStepProps {
  data: {
    MTN: Record<string, number>;
    TELECEL: Record<string, number>;
    AIRTELTIGO: Record<string, number>;
  };
  onChange: (data: BundleConfigStepProps['data']) => void;
  onNext: () => void;
  onBack: () => void;
}

// Reseller markup is 8%, retail is 15%
const RESELLER_MARKUP = 0.08;
const RETAIL_MARKUP = 0.15;

export function BundleConfigStep({ data, onChange, onNext, onBack }: BundleConfigStepProps) {
  const [activeNetwork, setActiveNetwork] = useState<Network>("MTN");
  const bundles = STATIC_BUNDLES[activeNetwork];

  const handlePriceChange = useCallback((network: Network, bundleId: string, price: number) => {
    onChange({
      ...data,
      [network]: {
        ...data[network],
        [bundleId]: price,
      },
    });
  }, [data, onChange]);

  const resellerCost = useCallback((basePrice: number) => basePrice * (1 + RESELLER_MARKUP), []);
  const retailPrice = useCallback((basePrice: number) => basePrice * (1 + RETAIL_MARKUP), []);

  const applyMarkupToAll = useCallback((network: Network, markupPercentage: number) => {
    const newData = { ...data };
    STATIC_BUNDLES[network].forEach(bundle => {
      const yourCost = resellerCost(bundle.price);
      newData[network][bundle.id] = yourCost * (1 + markupPercentage);
    });
    onChange(newData);
  }, [data, onChange, resellerCost]);

  const resetToRetail = useCallback((network: Network) => {
    const newData = { ...data };
    STATIC_BUNDLES[network].forEach(bundle => {
      newData[network][bundle.id] = retailPrice(bundle.price);
    });
    onChange(newData);
  }, [data, onChange, retailPrice]);

  return (
    <div className="space-y-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-4 liquid-glass rounded-full px-4 py-2">
          <Coins className="h-4 w-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Pricing Setup</span>
        </div>
        <h2 className="font-heading text-3xl md:text-4xl text-text-primary mb-2">
          Set Your Bundle Prices
        </h2>
        <p className="text-text-secondary font-barlow max-w-2xl mx-auto">
          Your cost is the wholesale price. Set your sell price to customers and earn the difference as profit.
        </p>
      </motion.div>

      {/* Network tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex justify-center gap-2 mb-6"
      >
        {NETWORKS.map((net) => (
          <button
            key={net}
            onClick={() => setActiveNetwork(net)}
            className={`px-4 py-2 rounded-btn text-sm font-semibold transition-all ${
              activeNetwork === net
                ? 'bg-accent-primary text-white shadow-sm'
                : 'border border-color-border text-text-secondary hover:bg-bg-elevated'
            }`}
            style={activeNetwork === net ? { background: NETWORK_COLORS[net], color: net === "MTN" ? "#1A1200" : "#fff" } : {}}
          >
            {net === "AIRTELTIGO" ? "AirtelTigo" : net}
          </button>
        ))}
      </motion.div>

      {/* Bundle list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <GlassPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-color-border/40">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted">Bundle</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted">Validity</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted">Your Cost</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted">Retail Price</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted">Your Price</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted">Your Profit</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((bundle, index) => {
                  const basePrice = bundle.price;
                  const yourCost = resellerCost(basePrice);
                  const calculatedRetail = retailPrice(basePrice);
                  const customPrice = data[activeNetwork][bundle.id] || calculatedRetail;
                  const profit = customPrice - yourCost;
                  const margin = customPrice > 0 ? ((profit / customPrice) * 100).toFixed(1) : "0";

                  return (
                    <motion.tr
                      key={bundle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-color-border/20 hover:bg-bg-elevated/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text-primary">{bundle.size}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-text-muted font-barlow">{bundle.validity}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-text-secondary">GH₵{yourCost.toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-text-muted">GH₵{calculatedRetail.toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={customPrice}
                          onChange={(e) => handlePriceChange(activeNetwork, bundle.id, parseFloat(e.target.value) || 0)}
                          min={yourCost}
                          step="0.50"
                          className="w-24 bg-bg-elevated border border-color-border rounded-input px-2 py-1.5 text-sm font-mono text-text-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {profit >= 0 ? (
                          <span className="text-color-success font-semibold text-sm">
                            +GH₵{profit.toFixed(2)} ({margin}%)
                          </span>
                        ) : (
                          <span className="text-color-error text-sm">
                            -GH₵{Math.abs(profit).toFixed(2)}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* Bulk actions */}
        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={() => applyMarkupToAll(activeNetwork, 0.15)} // 15% profit margin
            className="text-sm text-accent-primary hover:underline font-barlow"
          >
            Apply 15% margin to all
          </button>
          <button
            onClick={() => applyMarkupToAll(activeNetwork, 0.20)} // 20% profit margin
            className="text-sm text-accent-primary hover:underline font-barlow"
          >
            Apply 20% margin to all
          </button>
          <button
            onClick={() => resetToRetail(activeNetwork)}
            className="text-sm text-text-muted hover:underline font-barlow"
          >
            Reset to retail
          </button>
        </div>

        <p className="text-xs text-text-muted font-barlow text-center">
          Your cost is 8% markup. Retail customers pay 15%. Set your price between these to earn profit.
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-between pt-4"
      >
        <GlowButton variant="secondary" onClick={onBack} type="button">
          ← Back
        </GlowButton>
        <GlowButton onClick={onNext}>
          Continue →
        </GlowButton>
      </motion.div>
    </div>
  );
}
