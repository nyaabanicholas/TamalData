"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { ShoppingCart, Database, TrendingUp } from "lucide-react";

interface StatStripProps {
  ordersToday: number;
  gbSold: number;
  revenueToday: number;
  profitToday: number;
  /** Margin is only meaningful (and only shown) for resellers. */
  showMargin?: boolean;
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    `${prefix}${v.toLocaleString("en-GH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  );

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
    return ctrl.stop;
  }, [mv, value]);

  return <motion.span>{display}</motion.span>;
}

export function StatStrip(s: StatStripProps) {
  const stats = [
    { label: "Orders today", icon: ShoppingCart, value: <AnimatedNumber value={s.ordersToday} /> },
    { label: "Data delivered today", icon: Database, value: <AnimatedNumber value={s.gbSold} suffix=" GB" decimals={1} /> },
    {
      label: "Spent today",
      icon: TrendingUp,
      value: <AnimatedNumber value={s.revenueToday} prefix="GH₵" decimals={2} />,
      note: s.showMargin && s.profitToday > 0 ? (
        <span className="text-color-success">
          <AnimatedNumber value={s.profitToday} prefix="+GH₵" decimals={2} /> margin
        </span>
      ) : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className={`liquid-glass rounded-[1.25rem] p-4 sm:p-5 ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted sm:text-sm">{stat.label}</span>
            <stat.icon className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
          </div>
          <div className="mt-3 font-display text-xl font-semibold sm:text-2xl tracking-tight text-text-primary tabular-nums">
            {stat.value}
          </div>
          {stat.note && <p className="mt-1 text-xs tabular-nums">{stat.note}</p>}
        </motion.div>
      ))}
    </div>
  );
}
