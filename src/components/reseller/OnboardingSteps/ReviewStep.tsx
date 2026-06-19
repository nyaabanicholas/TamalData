"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { Eye, Coins, Store, Percent } from "lucide-react";

interface StoreInfo {
  slug: string;
  displayName: string;
  bio: string;
  whatsapp: string;
}

interface NetworkVisibility {
  showMTN: boolean;
  showTelecel: boolean;
  showAirtelTigo: boolean;
}

interface WizardState {
  step: number;
  storeInfo: StoreInfo;
  networkVisibility: NetworkVisibility;
  bundles: {
    MTN: Record<string, number>;
    TELECEL: Record<string, number>;
    AIRTELTIGO: Record<string, number>;
  };
}

interface ReviewStepProps {
  state: WizardState;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const RETAIL_MARKUP = 0.15;

export function ReviewStep({ state, onBack, onSubmit, loading }: ReviewStepProps) {
  const { storeInfo, networkVisibility, bundles } = state;

  // Count bundles with custom pricing (different from retail)
  let customPriced = 0;  Object.values(bundles).forEach((networkBundles) => {
    Object.values(networkBundles).forEach((customPrice) => {
      // For demo purposes, we'll estimate based on average bundle price
      const retailPrice = 10 * (1 + RETAIL_MARKUP);
      
      if (customPrice !== retailPrice) {
        customPriced++;
      }
    });
  });

  const activeNetworks = Object.values(networkVisibility).filter(Boolean).length;

  return (
    <div className="space-y-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-4 liquid-glass rounded-full px-4 py-2">
          <Eye className="h-4 w-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Review & Confirm</span>
        </div>
        <h2 className="font-heading text-3xl md:text-4xl text-text-primary mb-2">
          Review Your Store Setup
        </h2>
        <p className="text-text-secondary font-barlow">
          Please review all your settings before publishing your store.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <GlassPanel className="p-4 text-center">
          <Store className="h-8 w-8 mx-auto mb-2 text-accent-primary" />
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Store Name</p>
          <p className="font-semibold text-text-primary truncate">{storeInfo.displayName || "Not set"}</p>
        </GlassPanel>

        <GlassPanel className="p-4 text-center">
          <div className="h-8 w-8 mx-auto mb-2 rounded-lg" style={{ backgroundColor: "#009DF9" }} />
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Store URL</p>
          <p className="font-mono text-xs text-accent-primary">tamaldata.com/shop/{storeInfo.slug || "not-set"}</p>
        </GlassPanel>

        <GlassPanel className="p-4 text-center">
          <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
            {Object.values(networkVisibility).filter(Boolean).map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-accent-primary mx-0.5" />
            ))}
          </div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Networks</p>
          <p className="font-semibold text-text-primary">{activeNetworks} active</p>
        </GlassPanel>

        <GlassPanel className="p-4 text-center">
          <Coins className="h-8 w-8 mx-auto mb-2 text-color-success" />
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Custom Pricing</p>
          <p className="font-semibold text-text-primary">{customPriced} bundles</p>
        </GlassPanel>
      </motion.div>

      {/* Detailed Review */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Store Information */}
        <GlassPanel>
          <h3 className="font-semibold text-text-primary mb-4">Store Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Display Name</p>
              <p className="font-medium text-text-primary">{storeInfo.displayName || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">URL Slug</p>
              <p className="font-mono text-text-primary">{storeInfo.slug || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">WhatsApp</p>
              <p className="font-medium text-text-primary">{storeInfo.whatsapp || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Description</p>
              <p className="font-medium text-text-primary">{storeInfo.bio || "Not set"}</p>
            </div>
          </div>
        </GlassPanel>

        {/* Networks & Visibility */}
        <GlassPanel>
          <h3 className="font-semibold text-text-primary mb-4">Networks & Visibility</h3>
          <div className="grid grid-cols-3 gap-3">
            {([
              { net: "MTN", key: "showMTN", color: "#FFCB00" },
              { net: "TELECEL", key: "showTelecel", color: "#E30613" },
              { net: "AIRTELTIGO", key: "showAirtelTigo", color: "#9333EA" },
            ] as const).map(({ net, key, color }) => {
              const isVisible = networkVisibility[key as keyof NetworkVisibility];
              return (
                <div key={net} className="text-center">
                  <div className="h-3 w-3 rounded-full mx-auto mb-1" style={{ backgroundColor: color }} />
                  <p className="text-xs font-medium" style={{ color }}>{net}</p>
                  <p className="text-xs text-text-muted">
                    {isVisible ? "Visible" : "Hidden"}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* Pricing Summary */}
        <GlassPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Pricing Summary</h3>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">Your margin</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {Object.entries(bundles).map(([network, networkBundles]) => {
              const bundleCount = Object.keys(networkBundles).length;
              if (bundleCount === 0) return null;
              


              return (
                <div key={network} className="liquid-glass rounded-lg p-3">
                  <p className="text-xs font-semibold text-text-primary mb-1">
                    {network === "AIRTELTIGO" ? "AirtelTigo" : network}
                  </p>
                  <p className="text-lg font-bold text-accent-primary">{bundleCount}</p>
                  <p className="text-xs text-text-muted">bundles priced</p>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-between pt-4"
      >
        <GlowButton variant="secondary" onClick={onBack} type="button" disabled={loading}>
          ← Back
        </GlowButton>
        <GlowButton onClick={onSubmit} disabled={loading}>
          {loading ? "Publishing..." : "Publish Store →"}
        </GlowButton>
      </motion.div>
    </div>
  );
}
