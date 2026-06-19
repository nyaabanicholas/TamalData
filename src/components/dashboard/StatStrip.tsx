"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Wallet, ShoppingCart, Database, TrendingUp } from "lucide-react";

interface StatStripProps {
  walletBalance: number;
  ordersToday: number;
  gbSold: number;
  revenueToday: number;
  profitToday: number;
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    `${prefix}${v.toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [mv, value]);

  return <motion.span>{display}</motion.span>;
}

const STATS = (s: StatStripProps) => [
  {
    label: "Wallet Balance",
    value: <AnimatedNumber value={s.walletBalance} prefix="GH₵" decimals={2} />,
    icon: Wallet,
    accent: "var(--accent-primary)",
    bg: "rgba(79,110,247,0.10)",
  },
  {
    label: "Orders Today",
    value: <AnimatedNumber value={s.ordersToday} />,
    icon: ShoppingCart,
    accent: "var(--accent-orange)",
    bg: "rgba(139,92,246,0.10)",
  },
  {
    label: "GB Sold Today",
    value: <AnimatedNumber value={s.gbSold} suffix=" GB" decimals={1} />,
    icon: Database,
    accent: "var(--accent-cyan)",
    bg: "rgba(6,182,212,0.10)",
  },
  {
    label: "Revenue / Profit Today",
    value: (
      <span className="inline-flex items-baseline gap-1.5">
        <AnimatedNumber value={s.revenueToday} prefix="GH₵" decimals={2} />
        <span className="text-text-muted text-base">/</span>
        <span className="text-color-success">
          <AnimatedNumber value={s.profitToday} prefix="GH₵" decimals={2} />
        </span>
      </span>
    ),
    icon: TrendingUp,
    accent: "var(--color-success)",
    bg: "rgba(5,150,105,0.10)",
  },
];

export function StatStrip(props: StatStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS(props).map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: stat.bg }}
            >
              <stat.icon className="h-4.5 w-4.5" style={{ color: stat.accent }} strokeWidth={1.5} />
            </span>
            <span className="text-xs text-text-muted font-barlow font-medium uppercase tracking-wide">
              {stat.label}
            </span>
          </div>
          <div className="font-heading text-2xl text-text-primary tabular-nums">
            {stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
