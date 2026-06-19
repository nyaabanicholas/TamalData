"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, History, BookMarked, Search, Store, Users } from "lucide-react";

const ACTIONS = [
  { href: "/buy",                       icon: ShoppingBag, label: "Buy Data",      color: "var(--accent-primary)" },
  { href: "/dashboard/orders",          icon: History,     label: "Orders",         color: "var(--accent-orange)" },
  { href: "/dashboard/saved-numbers",   icon: BookMarked,  label: "Saved Numbers",  color: "var(--accent-cyan)" },
  { href: "/track",                     icon: Search,      label: "Track Order",    color: "var(--color-warning)" },
  { href: "/reseller",                  icon: Store,       label: "Reseller",       color: "var(--color-success)" },
  { href: "/dashboard/referrals",       icon: Users,       label: "Referrals",      color: "var(--accent-primary)" },
];

export function QuickActions() {
  return (
    <div className="liquid-glass rounded-2xl p-5">
      <h2 className="font-heading text-base text-text-primary mb-4">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-2.5">
        {ACTIONS.map((a, i) => (
          <motion.div
            key={a.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={a.href}
              className="liquid-glass-hover liquid-glass flex flex-col items-center gap-2 rounded-xl p-3.5 text-center"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${a.color}18` }}
              >
                <a.icon className="h-4.5 w-4.5" style={{ color: a.color }} strokeWidth={1.5} />
              </span>
              <span className="text-[11px] font-barlow font-semibold text-text-secondary leading-tight">
                {a.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
