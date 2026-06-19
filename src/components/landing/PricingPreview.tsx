"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BundleCard } from "@/components/ui/BundleCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { useRouter } from "next/navigation";
import { STATIC_BUNDLES, NETWORK_AVAILABLE } from "@/lib/staticBundles";
import type { Network } from "@/types";

const TABS: { key: Network; label: string; color: string }[] = [
  { key: "MTN",        label: "MTN",        color: "#FFCB00" },
  { key: "TELECEL",    label: "Telecel",    color: "#E30613" },
  { key: "AIRTELTIGO", label: "AirtelTigo", color: "#9333EA" },
];

export function PricingPreview() {
  const [active, setActive] = useState<Network>("MTN");
  const router = useRouter();

  const bundles = STATIC_BUNDLES[active].slice(0, 6);
  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${activeTab.color}1f 0%, transparent 70%)`,
          transition: "background 0.5s ease",
        }}
      />

      {/* Theme-reactive media blob */}
      <div
        className="absolute top-1/4 -right-32 w-[600px] h-[600px] pointer-events-none opacity-20 dark:opacity-10"
        style={{
          background: `radial-gradient(circle at 40% 50%, ${activeTab.color}20 0%, transparent 70%)`,
          filter: "blur(100px)",
          transition: "all 0.5s ease",
        }}
      />

      <div className="container-content relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <span className="liquid-glass inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest mb-5 text-text-secondary font-barlow">
            Live Prices
          </span>
          <h2 className="font-heading text-text-primary text-4xl sm:text-5xl leading-tight mb-4">
            Ghana&apos;s Best Data Rates
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto font-barlow font-light">
            All bundles have 90-day validity. No hidden fees. Fast delivery.
          </p>
        </motion.div>

        {/* Network tabs */}
        <div className="liquid-glass flex gap-2 justify-center mb-10 p-1.5 rounded-full w-fit mx-auto">
          {TABS.map((tab) => {
            const available = NETWORK_AVAILABLE[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => available && setActive(tab.key)}
                disabled={!available}
                className="relative px-5 py-2.5 rounded-full text-sm font-semibold font-barlow transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={
                  active === tab.key
                    ? {
                        backgroundColor: tab.color,
                        color: tab.key === "MTN" ? "#1A1200" : "#fff",
                        boxShadow: `0 4px 20px ${tab.color}40`,
                      }
                    : {
                        color: "var(--text-secondary)",
                      }
                }
              >
                {tab.label}
                {!available && (
                  <span className="ml-1.5 text-[9px] font-bold uppercase tracking-widest opacity-70">Soon</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bundle grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10"
          >
            {bundles.map((bundle, i) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <BundleCard
                  bundle={bundle}
                  onSelect={() => router.push(`/buy?network=${active}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="text-center">
          <GlowButton onClick={() => router.push(`/buy?network=${active}`)} size="lg">
            See All {STATIC_BUNDLES[active].length} Bundles →
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
