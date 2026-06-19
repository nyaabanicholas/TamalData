"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Play, Clock, Globe } from "lucide-react";
import { FadingVideo } from "@/components/ui/FadingVideo";
import { BlurText } from "@/components/ui/BlurText";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const HERO_VIDEO = "/videos/hero.mp4";

const enter = {
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
};

const NETWORKS = ["MTN", "Telecel", "AirtelTigo"];

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Default to dark mode until mounted (avoids flash of wrong theme)
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <section
      className={`relative min-h-[100dvh] flex flex-col overflow-hidden ${
        isDark ? "cinematic video-readable" : ""
      }`}
      style={{ touchAction: "pan-y" }}
    >
      {/* Light-mode: animated radial glow behind the orb — stronger so the orb reads clearly */}
      {!isDark && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[900px] h-[900px] top-[8%] left-1/2 -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 42% 38%, rgba(0,157,249,0.35) 0%, rgba(0,157,249,0.18) 30%, rgba(254,142,1,0.08) 50%, transparent 72%)",
              filter: "blur(70px)",
              animation: "orb-pulse-light 5s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* Background video */}
      {!isDark ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-[1]"
          style={{
            width: "120%",
            height: "120%",
            mixBlendMode: "screen",
            opacity: 1,
            filter: "brightness(1.5) contrast(1.15)",
          }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      ) : (
        <FadingVideo
          src={HERO_VIDEO}
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: "120%", height: "120%" }}
        />
      )}

      {/* Light-mode ambient gradient — lighter touch so the orb isn't washed out */}
      {!isDark && (
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 55%, rgba(244,246,255,0.25) 0%, rgba(244,246,255,0.55) 55%, rgba(244,246,255,0.92) 100%)",
          }}
        />
      )}

      {/* Content layer */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
        {/* Badge */}
        <motion.div
          initial={enter.initial}
          animate={enter.animate}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className={`inline-flex items-center gap-2 rounded-full pr-3 ${
            isDark
              ? "liquid-glass-strong"
              : "liquid-glass"
          }`}
        >
          <span className="rounded-full bg-accent-primary px-3 py-1 text-xs font-semibold text-white">
            New
          </span>
          <span
            className={`text-sm font-barlow ${
              isDark ? "text-on-media-muted" : "text-text-secondary"
            }`}
          >
            Live bundles on every network
          </span>
        </motion.div>

        {/* Headline */}
        <div className="mt-6 max-w-2xl">
          <BlurText
            text="Ghana's Fastest Data Across Every Network"
            className={`font-heading text-[1.875rem] sm:text-4xl md:text-6xl lg:text-7xl leading-[0.95] ${
              isDark ? "text-on-media" : "text-text-primary"
            }`}
          />
        </div>

        {/* Subheading */}
        <motion.p
          initial={enter.initial}
          animate={enter.animate}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
          className={`mt-4 max-w-2xl text-sm md:text-base font-barlow font-medium leading-relaxed ${
            isDark ? "text-on-media-muted" : "text-text-secondary"
          }`}
        >
          MTN data bundles from GH₵4.60, delivered within minutes.
          No account needed — pay with Mobile Money and your data lands fast.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={enter.initial}
          animate={enter.animate}
          transition={{ duration: 0.6, ease: "easeOut", delay: 1.1 }}
          className="mt-6 flex items-center gap-6"
        >
          <Link
            href="/buy"
            className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
              isDark
                ? "liquid-glass-strong text-on-media"
                : "liquid-glass text-text-primary"
            }`}
          >
            Buy Data Now
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/track"
            className={`inline-flex items-center gap-2 text-sm font-semibold font-barlow ${
              isDark ? "text-on-media-muted" : "text-text-secondary hover:text-accent-primary"
            }`}
          >
            Track Order
            <Play className="h-4 w-4 fill-current" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={enter.initial}
          animate={enter.animate}
          transition={{ duration: 0.6, ease: "easeOut", delay: 1.3 }}
          className="relative z-20 mt-8 flex items-stretch gap-3 justify-center w-full max-w-[464px] px-2"
        >
          <div
            className={`flex-1 min-w-0 max-w-[220px] rounded-[1.25rem] p-5 text-left ${
              isDark
                ? "liquid-glass-media"
                : "liquid-glass"
            }`}
          >
            <Clock className="h-7 w-7 text-accent-primary" strokeWidth={1.5} />
            <div
              className={`mt-2 font-heading text-xl md:text-3xl leading-none ${
                isDark ? "text-on-media" : "text-text-primary"
              }`}
            >
              30,000+
            </div>
            <div
              className={`mt-2 text-xs font-barlow font-medium ${
                isDark ? "text-on-media-muted" : "text-text-secondary"
              }`}
            >
              Orders Delivered
            </div>
          </div>
          <div
            className={`flex-1 min-w-0 max-w-[220px] rounded-[1.25rem] p-5 text-left ${
              isDark
                ? "liquid-glass-media"
                : "liquid-glass"
            }`}
          >
            <Globe className="h-7 w-7 text-accent-primary" strokeWidth={1.5} />
            <div
              className={`mt-2 font-heading text-xl md:text-3xl leading-none ${
                isDark ? "text-on-media" : "text-text-primary"
              }`}
            >
              10–30 min
            </div>
            <div
              className={`mt-2 text-xs font-barlow font-medium ${
                isDark ? "text-on-media-muted" : "text-text-secondary"
              }`}
            >
              Average Delivery
            </div>
          </div>
        </motion.div>
      </div>

      {/* Partners / networks */}
      <motion.div
        initial={enter.initial}
        animate={enter.animate}
        transition={{ duration: 0.6, ease: "easeOut", delay: 1.4 }}
        className="relative z-20 flex flex-col items-center gap-4 pb-10"
      >
        <div
          className={`rounded-full px-3.5 py-1 text-xs font-medium font-barlow ${
            isDark
              ? "liquid-glass-strong text-on-media-muted"
              : "liquid-glass text-text-secondary"
          }`}
        >
          Connecting Ghana on every major network
        </div>
        <div className="flex items-center gap-12 md:gap-16">
          {NETWORKS.map((n) => (
            <span
              key={n}
              className={`font-heading text-xl md:text-2xl ${
                isDark ? "text-on-media" : "text-text-primary/70"
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Fade transition overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 md:h-72 pointer-events-none z-[5]"
        style={{
          background: isDark
            ? "linear-gradient(to top, rgba(var(--section-fade-rgb), 0.98) 0%, rgba(var(--section-fade-rgb), 0.55) 38%, rgba(var(--section-fade-rgb), 0) 100%)"
            : "linear-gradient(to top, rgba(244,246,255, 0.95) 0%, rgba(244,246,255, 0.50) 40%, transparent 100%)",
        }}
      />
    </section>
  );
}
