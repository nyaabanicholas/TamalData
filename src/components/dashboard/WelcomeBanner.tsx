"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import { DepositModal } from "./DepositModal";
import { formatGHS } from "@/lib/utils";

interface WelcomeBannerProps {
  name: string;
  role?: string;
  walletBalance: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function WelcomeBanner({ name, role, walletBalance }: WelcomeBannerProps) {
  const [depositOpen, setDepositOpen] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");
  const router = useRouter();

  // Client-only: avoids SSR/hydration timezone mismatch
  useEffect(() => setGreeting(getGreeting()), []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="liquid-glass relative flex flex-col justify-between gap-8 overflow-hidden rounded-[1.5rem] p-6 md:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(0,157,249,0.18), transparent)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <p className="text-sm text-text-muted">{greeting}</p>
            <span className="rounded-full bg-accent-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-accent-primary ring-1 ring-inset ring-accent-primary/20">
              {role === "RESELLER" ? "Reseller" : "Buyer"}
            </span>
          </div>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl tracking-tight text-text-primary">{name}</h1>
          <p className="mt-2 max-w-md text-sm text-text-secondary text-pretty">
            Buy bundles, track deliveries and manage your wallet in one place.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center gap-3">
          <Link
            href="/buy"
            className="group inline-flex items-center gap-2 rounded-full bg-accent-primary py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-transform duration-200 active:scale-[0.98]"
          >
            Buy data
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href="/buy/bulk"
            className="rounded-full px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Bulk order
          </Link>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        className="relative overflow-hidden rounded-[1.5rem] p-6 md:p-8 text-white"
        style={{
          background:
            "radial-gradient(120% 90% at 100% 0%, rgba(0,157,249,0.55), transparent 55%), radial-gradient(90% 80% at 0% 100%, rgba(254,142,1,0.28), transparent 60%), #071226",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 60px -30px rgba(0,100,200,0.6)",
        }}
      >
        <p className="text-sm text-white/70">Wallet balance</p>
        <p className="mt-2 font-display text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
          {formatGHS(walletBalance)}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDepositOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#071226] transition-transform duration-200 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Top up
          </button>
          <Link
            href="/dashboard/transactions"
            className="rounded-full px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            View history
          </Link>
        </div>
      </motion.section>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} onSuccess={() => router.refresh()} />
    </div>
  );
}
