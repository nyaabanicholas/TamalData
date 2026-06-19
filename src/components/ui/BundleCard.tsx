"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Wifi } from "lucide-react";
import type { DataBundle } from "@/types";

const NETWORK_ACCENT: Record<string, { color: string; glow: string; badge: string; gradient: string; textOnCard: string }> = {
  MTN:        { color: "#FFCB00", glow: "rgba(255,203,0,0.4)",  badge: "rgba(255,203,0,0.12)", gradient: "linear-gradient(135deg, #E6B800 0%, #FFCB00 50%, #FFD84D 100%)", textOnCard: "#1A1200" },
  TELECEL:    { color: "#E30613", glow: "rgba(227,6,19,0.4)",   badge: "rgba(227,6,19,0.12)", gradient: "linear-gradient(135deg, #B50010 0%, #E30613 50%, #FF1A26 100%)", textOnCard: "#FFFFFF" },
  AIRTELTIGO: { color: "#9333EA", glow: "rgba(147,51,234,0.4)", badge: "rgba(147,51,234,0.12)", gradient: "linear-gradient(135deg, #7928CA 0%, #9333EA 50%, #A855F7 100%)", textOnCard: "#FFFFFF" },
};

interface BundleCardProps {
  bundle: DataBundle;
  selected?: boolean;
  onSelect?: (bundle: DataBundle) => void;
}

export function BundleCard({ bundle, selected = false, onSelect }: BundleCardProps) {
  const accent = NETWORK_ACCENT[bundle.network.toUpperCase()] ?? {
    color: "#009DF9",
    glow: "rgba(0,157,249,0.4)",
    badge: "rgba(0,157,249,0.12)",
    gradient: "linear-gradient(135deg, #0078C8 0%, #009DF9 50%, #33B5FF 100%)",
    textOnCard: "#FFFFFF",
  };

  return (
    <motion.button
      type="button"
      onClick={() => !bundle.available ? undefined : onSelect?.(bundle)}
      className={cn(
        "relative w-full text-left rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer focus-visible:outline-none group",
        !bundle.available && "opacity-60 cursor-not-allowed"
      )}
      style={{
        background: accent.gradient,
        border: selected
          ? `1.5px solid rgba(255,255,255,0.8)`
          : `1.5px solid rgba(255,255,255,0.1)`,
        boxShadow: selected
          ? `0 0 0 2px ${accent.color}, 0 12px 40px ${accent.glow}, inset 0 1px 1px rgba(255,255,255,0.3)`
          : `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)`,
      }}
      whileHover={bundle.available ? { y: -4, scale: 1.02 } : {}}
      whileTap={bundle.available ? { scale: 0.98 } : {}}
      disabled={!bundle.available}
      aria-pressed={selected}
    >
      {/* Liquid glass overlay */}
      <div className="absolute inset-0 liquid-glass pointer-events-none opacity-30" />

      {/* Colored top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[4px] transition-opacity duration-200"
        style={{
          background: `linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.8))`,
          opacity: selected ? 1 : 0.3,
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 70%)` }}
      />

      {/* Selected glow */}
      {selected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 70%)` }}
        />
      )}

      <div className="relative p-5 z-10">
        {/* Header: icon + validity */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "rgba(0,0,0,0.15)", backdropFilter: "blur(8px)" }}
          >
            <Wifi className="h-5 w-5" style={{ color: accent.textOnCard }} />
          </div>
          <span 
            className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full backdrop-blur-md border border-white/10"
            style={{ color: accent.textOnCard, backgroundColor: `${accent.textOnCard === "#1A1200" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)"}` }}
          >
            {bundle.type === "non-expiry" ? "No Expiry" : bundle.validity}
          </span>
        </div>

        {/* Size */}
        <p 
          className="font-barlow font-extrabold text-[2rem] leading-none mb-1 drop-shadow-md"
          style={{ color: accent.textOnCard }}
        >
          {bundle.size}
        </p>

        <p 
          className="text-xs font-medium mb-5 uppercase tracking-wider opacity-80"
          style={{ color: accent.textOnCard }}
        >
          {bundle.network} Bundle
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 w-fit px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10"
          style={{ backgroundColor: `${accent.textOnCard === "#1A1200" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)"}` }}>
          <span className="text-xs font-bold" style={{ color: accent.textOnCard }}>GH₵</span>
          <span
            className="font-display font-bold text-2xl drop-shadow-sm"
            style={{ color: accent.textOnCard }}
          >
            {bundle.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div
          className="absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center shadow-lg bg-white/20 backdrop-blur-md border border-white/30"
        >
          <span className="text-[12px] font-extrabold" style={{ color: accent.textOnCard }}>✓</span>
        </div>
      )}

      {!bundle.available && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[20px] z-20 liquid-glass-strong backdrop-blur-md"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <span className="text-sm text-white font-bold px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-xl backdrop-blur-lg uppercase tracking-widest">
            Coming Soon
          </span>
        </div>
      )}
    </motion.button>
  );
}
