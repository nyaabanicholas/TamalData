"use client";

import { motion } from "framer-motion";
import { cn, formatGHS } from "@/lib/utils";
import { Zap } from "lucide-react";
import type { Network } from "@/types";

const NETWORK_CONFIG: Record<
  Network,
  {
    label: string;
    abbrev: string;
    primaryColor: string;
    gradient: string;
    glowColor: string;
    textOnCard: string;
    tagline: string;
  }
> = {
  MTN: {
    label: "MTN",
    abbrev: "MTN",
    primaryColor: "#FFCB00",
    gradient: "linear-gradient(135deg, #E6B800 0%, #FFCB00 50%, #FFD84D 100%)",
    glowColor: "rgba(255,203,0,0.4)",
    textOnCard: "#1A1200",
    tagline: "Ghana's largest network",
  },
  TELECEL: {
    label: "Telecel",
    abbrev: "TCL",
    primaryColor: "#E30613",
    gradient: "linear-gradient(135deg, #B50010 0%, #E30613 50%, #FF1A26 100%)",
    glowColor: "rgba(227,6,19,0.4)",
    textOnCard: "#FFFFFF",
    tagline: "Fast & reliable coverage",
  },
  AIRTELTIGO: {
    label: "AirtelTigo",
    abbrev: "AT",
    primaryColor: "#9333EA",
    gradient: "linear-gradient(135deg, #7928CA 0%, #9333EA 50%, #A855F7 100%)",
    glowColor: "rgba(147,51,234,0.4)",
    textOnCard: "#FFFFFF",
    tagline: "Premium data speeds",
  },
};

interface NetworkCardProps {
  network: Network;
  cheapestPrice?: number;
  isOperational?: boolean;
  selected?: boolean;
  onSelect?: (network: Network) => void;
  compact?: boolean;
}

export function NetworkCard({
  network,
  cheapestPrice,
  isOperational = true,
  selected = false,
  onSelect,
  compact = false,
}: NetworkCardProps) {
  const { label, abbrev, primaryColor, glowColor, textOnCard, tagline } =
    NETWORK_CONFIG[network];

  if (compact) {
    return (
      <motion.button
        type="button"
        className={cn(
          "relative w-full text-left rounded-card transition-all duration-200 overflow-hidden focus-visible:outline-none cursor-pointer p-4 liquid-glass",
          selected ? "shadow-glow-sm ring-2" : ""
        )}
        style={selected ? { borderColor: primaryColor, boxShadow: `0 0 0 2px ${primaryColor}40` } : {}}
        onClick={() => onSelect?.(network)}
        whileTap={{ scale: 0.97 }}
        aria-pressed={selected}
      >
        <div
          className="absolute inset-0 opacity-[0.06] rounded-card"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="relative flex items-center gap-3 z-10">
          <div
            className="h-9 w-11 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0"
            style={{ backgroundColor: primaryColor, color: textOnCard }}
          >
            {abbrev}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-text-primary">{label}</p>
            {cheapestPrice != null && (
              <p className="text-xs text-text-secondary">From {formatGHS(cheapestPrice)}</p>
            )}
          </div>
          <div
            className={cn(
              "ml-auto h-2 w-2 rounded-full shrink-0",
              isOperational ? "animate-pulse-dot" : "opacity-30"
            )}
            style={{ backgroundColor: isOperational ? "#10B981" : primaryColor }}
          />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      className="relative w-full focus-visible:outline-none cursor-pointer group"
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect?.(network)}
      aria-pressed={selected}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute -inset-1.5 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)` }}
        animate={selected ? { opacity: 1 } : {}}
      />

      {/* Card — liquid-glass only, no gradient background */}
      <div
        className={cn(
          "relative rounded-[18px] overflow-hidden transition-all duration-300 liquid-glass",
          selected ? "shadow-glow-lg ring-glow" : "shadow-card-border",
          "min-h-[220px] flex flex-col justify-between p-6"
        )}
      >
        {/* Top row: badge + status */}
        <div className="relative flex items-start justify-between z-10">
          <div
            className="h-11 w-16 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm tracking-wider"
            style={{
              backgroundColor: primaryColor,
              color: textOnCard,
            }}
          >
            {abbrev}
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
              "glass"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOperational ? "animate-pulse-dot" : "opacity-40"
              )}
              style={{ backgroundColor: isOperational ? "#4ADE80" : "#9CA3AF" }}
            />
            <span className="text-text-primary">{isOperational ? "Live" : "Down"}</span>
          </div>
        </div>

        {/* Bottom: name + price */}
        <div className="relative z-10">
          <p className="font-heading text-text-primary text-2xl md:text-3xl mb-1 tracking-tight">
            {label}
          </p>
          <p className="text-sm font-medium mb-3 text-text-secondary font-barlow">
            {tagline}
          </p>

          {cheapestPrice != null && (
            <div className="glass inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold">
              <Zap className="h-3.5 w-3.5 text-accent-primary" />
              <span className="text-text-primary">From {formatGHS(cheapestPrice)}</span>
            </div>
          )}
        </div>

        {/* Selected checkmark */}
        {selected && (
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full glass flex items-center justify-center z-10">
            <span className="text-accent-primary text-sm font-extrabold">✓</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
