"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function ResellerBanner() {
  return (
    <section className="section-padding relative overflow-hidden bg-orbs">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,157,249,0.06) 0%, rgba(0,157,249,0.02) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="container-content relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="liquid-glass rounded-[1.25rem] px-6 py-12 md:px-12 md:py-16 text-center"
        >
          <div className="liquid-glass inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-text-secondary text-sm font-barlow">
            <TrendingUp className="h-4 w-4" />
            Reseller Programme
          </div>

          <h2 className="font-heading text-text-primary text-5xl lg:text-6xl leading-tight mb-4">
            Sell Data. Earn Daily.
          </h2>

          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8 font-barlow font-light">
            Join the TamalData reseller programme. Buy wholesale. Set your own
            price. Get paid instantly to your MoMo wallet.
          </p>

          <Link
            href="/auth/register?role=reseller"
            className="group inline-flex items-center gap-2 rounded-full bg-accent-primary px-6 py-3 text-base font-semibold text-white transition-transform duration-300 active:scale-[0.98]"
          >
            Become a Reseller
            <TrendingUp className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
