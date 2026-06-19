"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BundleCard } from "@/components/ui/BundleCard";
import { InlineOrderPanel } from "./InlineOrderPanel";
import { useBuyStore } from "@/store/useBuyStore";
import { STATIC_BUNDLES } from "@/lib/staticBundles";
import type { DataBundle, Network } from "@/types";

export function InlineBundleGrid() {
  const { network, goToStep } = useBuyStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Render static bundles instantly, then overlay admin-priced values so the
  // displayed price matches exactly what the order route will charge.
  const staticBundles: DataBundle[] = network ? STATIC_BUNDLES[network as Network] : [];
  const [priced, setPriced] = useState<Record<string, { price: number; costPrice: number }>>({});

  useEffect(() => {
    if (!network) return;
    let cancelled = false;
    fetch(`/api/bundles?network=${network}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { id: string; price: number; costPrice: number }[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const map: Record<string, { price: number; costPrice: number }> = {};
        for (const b of data) map[b.id] = { price: b.price, costPrice: b.costPrice };
        setPriced(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [network]);

  const bundles: DataBundle[] = staticBundles.map((b) =>
    priced[b.id] ? { ...b, price: priced[b.id].price } : b,
  );

  const handleSelect = (bundle: DataBundle) => {
    if (!bundle.available) return;
    setSelectedId((prev) => (prev === bundle.id ? null : bundle.id));
  };

  const networkLabel: Record<string, string> = {
    MTN: "MTN",
    TELECEL: "Telecel",
    AIRTELTIGO: "AirtelTigo",
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => goToStep("network")}
          className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium font-barlow text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h2 className="font-heading text-2xl text-text-primary">
            {network ? networkLabel[network] : ""} Bundles
          </h2>
          <p className="text-sm text-text-secondary font-barlow">
            Pick a bundle, enter a number, and pay
          </p>
        </div>
      </div>

      {/* Bundle grid — instant, no loading skeleton needed */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {bundles.map((bundle) => {
          const isExpanded = selectedId === bundle.id;
          return (
            <div key={bundle.id} className="flex flex-col gap-3">
              <BundleCard
                bundle={bundle}
                selected={isExpanded}
                onSelect={handleSelect}
              />

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <InlineOrderPanel bundle={bundle} costPrice={priced[bundle.id]?.costPrice} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {bundles.length === 0 && (
        <div className="liquid-glass rounded-2xl p-8 text-center text-text-secondary font-barlow">
          No bundles available for {network} right now.
        </div>
      )}
    </div>
  );
}
