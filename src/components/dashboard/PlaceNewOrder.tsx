"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Network } from "@/types";

const NETWORKS: { id: Network; label: string; short: string; color: string; bg: string }[] = [
  { id: "MTN",       label: "MTN",        short: "MTN",        color: "#FCD34D", bg: "rgba(252,211,77,0.12)" },
  { id: "TELECEL",   label: "Telecel",    short: "TCL",    color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  { id: "AIRTELTIGO", label: "AirtelTigo", short: "AT", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
];

export function PlaceNewOrder() {
  const router = useRouter();

  return (
    <div className="liquid-glass rounded-[1.25rem] p-6">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Buy a bundle</h2>
        <span className="text-xs text-text-muted">Delivered in 10-30 min</span>
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
            className="flex flex-col items-center gap-2.5 rounded-2xl p-5 ring-1 ring-inset ring-white/5 transition-shadow duration-300 hover:ring-white/15"
            style={{ background: net.bg }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-display font-bold tracking-wide"
              style={{ background: `${net.color}22`, color: net.color, border: `1.5px solid ${net.color}44` }}
            >
              {net.short}
            </span>
            <span className="text-sm font-semibold text-text-primary font-barlow">{net.label}</span>
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => router.push("/buy")}
        className="mt-4 w-full rounded-xl py-2.5 text-sm font-medium text-text-secondary ring-1 ring-inset ring-color-border/60 transition-colors hover:bg-bg-elevated/60 hover:text-text-primary"
      >
        Browse all bundles
      </button>
    </div>
  );
}
