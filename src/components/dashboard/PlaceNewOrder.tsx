"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Network } from "@/types";

const NETWORKS: { id: Network; label: string; color: string; bg: string }[] = [
  { id: "MTN",       label: "MTN",        color: "#FCD34D", bg: "rgba(252,211,77,0.12)" },
  { id: "TELECEL",   label: "Telecel",    color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  { id: "AIRTELTIGO", label: "AirtelTigo", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
];

export function PlaceNewOrder() {
  const router = useRouter();

  return (
    <div className="liquid-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-lg text-text-primary">Buy Data Bundle</h2>
        <span className="liquid-glass rounded-full px-3 py-1 text-[11px] font-barlow font-semibold text-text-muted uppercase tracking-wider">
          Fast delivery
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {NETWORKS.map((net, i) => (
          <motion.button
            key={net.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/buy?network=${net.id}`)}
            className="liquid-glass-hover liquid-glass flex flex-col items-center gap-2.5 rounded-xl p-5"
            style={{ background: net.bg }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-heading font-bold"
              style={{ background: `${net.color}22`, color: net.color, border: `1.5px solid ${net.color}44` }}
            >
              {net.label.slice(0, 3).toUpperCase()}
            </span>
            <span className="text-sm font-semibold text-text-primary font-barlow">{net.label}</span>
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => router.push("/buy")}
        className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-on-media transition-all"
        style={{ background: "var(--gradient-cta)" }}
      >
        Browse all bundles →
      </button>
    </div>
  );
}
