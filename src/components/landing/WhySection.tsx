"use client";

import { motion } from "framer-motion";
import { FadingVideo } from "@/components/ui/FadingVideo";
import { Zap, Network, Wallet } from "lucide-react";

const CAPABILITIES_VIDEO = "/videos/capabilities.mp4";
const CAPABILITIES_POSTER = "/videos/capabilities-poster.jpg";
const EASE = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  {
    icon: Zap,
    title: "Fast Delivery",
    tags: ["10-30 min", "Auto-refund", "24/7 uptime"],
    body: "Data lands on your number within 10-30 minutes. No queues, no waiting on an agent.",
  },
  {
    icon: Network,
    title: "All Networks",
    tags: ["MTN", "Telecel", "AirtelTigo"],
    body: "One platform for every major Ghana network. Any bundle, any line, one checkout.",
  },
  {
    icon: Wallet,
    title: "Reseller Pricing",
    tags: ["Wholesale rates", "MoMo payout", "No hidden fees"],
    body: "Sourced from wholesale network partners and passed straight to you at the lowest price.",
  },
];

// The video has a baked-in black backdrop, so it lives inside a framed dark
// "stage" in both themes instead of bleeding edge-to-edge as a black band.
export function WhySection() {
  return (
    <section className="relative px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl rounded-[2rem] p-1.5 ring-1 ring-black/5 bg-black/[0.03] dark:ring-white/10 dark:bg-white/[0.03] shadow-[0_30px_80px_-30px_rgba(0,40,90,0.45)]">
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#05060f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          <FadingVideo
            src={CAPABILITIES_VIDEO}
            poster={CAPABILITIES_POSTER}
            className="absolute inset-0 h-full w-full object-cover object-[50%_35%] why-video-mask"
          />
          {/* Readability scrim: dark at the bottom where the cards sit */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,6,15,0.55) 0%, rgba(5,6,15,0.05) 35%, rgba(5,6,15,0.35) 60%, rgba(5,6,15,0.9) 100%)",
            }}
          />

          <div className="relative z-10 flex min-h-[640px] flex-col justify-between gap-16 p-6 sm:p-10 md:p-14">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="max-w-xl font-heading text-3xl md:text-5xl leading-[1.05] text-on-media text-balance"
            >
              Built for speed, every network.
            </motion.h2>

            <div className="grid gap-4 md:grid-cols-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.7, ease: EASE }}
                  className="why-card flex flex-col rounded-[1.25rem] p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-white/[0.07] ring-1 ring-white/10">
                    <f.icon className="h-[18px] w-[18px] text-on-media" strokeWidth={1.5} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-barlow font-medium text-white/75 ring-1 ring-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <h3 className="mt-auto pt-8 font-heading text-2xl text-on-media">{f.title}</h3>
                  <p className="mt-2 text-sm font-barlow leading-relaxed text-white/70 text-pretty">
                    {f.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
