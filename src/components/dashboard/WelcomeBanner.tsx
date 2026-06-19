"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ShoppingBag, History, CreditCard, Zap, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { DepositModal } from "./DepositModal";

interface WelcomeBannerProps {
  name: string;
  role?: string;
}

const ACTIONS = [
  { label: "Deposit",      icon: CreditCard, accent: "var(--accent-primary)" },
  { label: "Orders",       href: "/dashboard/orders",   icon: ShoppingBag, accent: "var(--accent-orange)" },
  { label: "Transactions", href: "/dashboard/transactions", icon: History,  accent: "var(--accent-cyan)" },
  { label: "Buy Bulk",     href: "/buy/bulk",      icon: Zap,         accent: "var(--color-warning)" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function WelcomeBanner({ name, role }: WelcomeBannerProps) {
  const [depositOpen, setDepositOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const router = useRouter();

  // Compute greeting on client only to avoid SSR/ hydration timezone mismatch
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="liquid-glass rounded-2xl overflow-hidden"
    >
      {/* Gradient accent bar */}
      <div className="h-1 w-full" style={{ background: "var(--gradient-cta)" }} />

      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-text-muted text-sm font-barlow">{greeting}</p>
            {role && role === "RESELLER" && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(0,157,249,0.12)", color: "var(--accent-primary)" }}>
                Reseller
              </span>
            )}
            {role && (role === "USER" || !role) && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "var(--color-success)" }}>
                Buyer
              </span>
            )}
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-text-primary">
            {name} 👋
          </h1>
          <p className="text-text-secondary text-sm font-barlow mt-1.5">
            Your dashboard — buy data, track orders, manage your wallet.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2.5">
          {ACTIONS.map((a) => (
            a.href ? (
              <Link
                key={a.label}
                href={a.href}
                className="liquid-glass-hover liquid-glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-text-primary"
              >
                <a.icon className="h-4 w-4" style={{ color: a.accent }} strokeWidth={1.5} />
                {a.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
              </Link>
            ) : (
              <button
                key={a.label}
                onClick={() => setDepositOpen(true)}
                className="liquid-glass-hover liquid-glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-text-primary"
              >
                <a.icon className="h-4 w-4" style={{ color: a.accent }} strokeWidth={1.5} />
                {a.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
              </button>
            )
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-6 md:px-8 pb-6 md:pb-8 flex justify-end">
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/");
            router.refresh();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-barlow font-medium text-text-muted hover:text-color-error transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} onSuccess={() => router.refresh()} />
    </motion.div>
  );
}
