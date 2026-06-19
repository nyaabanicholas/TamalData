"use client";

import { motion } from "framer-motion";
import { FadingVideo } from "@/components/ui/FadingVideo";
import { Zap, Network, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const CAPABILITIES_VIDEO = "/videos/capabilities.mp4";

const FEATURES = [
  {
    icon: Zap,
    title: "Fast Delivery",
    tags: ["10–30 min", "Auto-refund", "24/7 uptime"],
    body: "Data lands on your number within 10–30 minutes — every time. No queues, no waiting on an agent.",
  },
  {
    icon: Network,
    title: "All Networks",
    tags: ["MTN", "Telecel", "AirtelTigo"],
    body: "One platform for every major Ghana network. Buy any bundle, on any line, from a single checkout.",
  },
  {
    icon: Wallet,
    title: "Reseller Pricing",
    tags: ["Wholesale rates", "MoMo payout", "No hidden fees"],
    body: "Sourced directly from DataMart Ghana's reseller API and passed straight to you at the lowest price.",
  },
];

export function WhySection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Default to dark mode until mounted (avoids flash of wrong theme)
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <section
      className={`relative overflow-hidden min-h-[90dvh] flex flex-col justify-center py-24 md:py-32 ${
        isDark
          ? "cinematic video-readable section-bridge section-fade-edge"
          : "section-fade-edge"
      }`}
    >
      {/* Background video */}
      <FadingVideo
        src={CAPABILITIES_VIDEO}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-12 max-w-2xl"
        >
          <span className="text-xs font-barlow uppercase tracking-[0.2em] text-on-media-muted">
            {/* Why TamalData */}
          </span>
          <h2
            className={`mt-4 font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[0.95] ${
              isDark ? "text-on-media" : "text-text-primary"
            }`}
          >
            Built for speed, every network.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`rounded-[1.25rem] p-6 min-h-[360px] flex flex-col ${
                isDark
                  ? "liquid-glass-strong"
                  : "liquid-glass"
              }`}
            >
              {/* Subtle dark overlay for text readability over video */}
              {isDark && (
                <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              )}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-[0.85rem] ${
                  isDark
                    ? "liquid-glass"
                    : "liquid-glass"
                }`}
              >
                <f.icon
                  className={`h-5 w-5 ${
                    isDark ? "text-on-media" : "text-accent-primary"
                  }`}
                  strokeWidth={1.5}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2 relative z-10">
                {f.tags.map((t) => (
                  <span
                    key={t}
                    className={`rounded-full px-3 py-1 text-[11px] font-barlow font-medium ${
                      isDark
                        ? "liquid-glass text-on-media-muted"
                        : "bg-bg-elevated text-text-secondary border border-color-border"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h3
                className={`mt-auto pt-6 font-heading text-2xl md:text-3xl relative z-10 ${
                  isDark ? "text-on-media" : "text-text-primary"
                }`}
              >
                {f.title}
              </h3>
              <p
                className={`mt-3 text-sm font-barlow font-medium leading-relaxed relative z-10 ${
                  isDark ? "text-on-media-muted" : "text-text-secondary"
                }`}
              >
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
