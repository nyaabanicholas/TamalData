"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Preloader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only show on first visit per session
    const seen = sessionStorage.getItem("__preloader_shown");
    if (seen) return;
    sessionStorage.setItem("__preloader_shown", "1");
    setVisible(true);

    // Animate progress ring 0→100 over ~1.4s
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const pct = Math.min(((now - start) / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Dismiss after 1.6s or when window.load fires (whichever is later)
    const dismiss = () => setTimeout(() => setVisible(false), 200);
    if (document.readyState === "complete") {
      setTimeout(dismiss, 300);
    } else {
      window.addEventListener("load", dismiss, { once: true });
    }
  }, []);

  // Circumference of r=44 circle
  const C = 2 * Math.PI * 44;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass-intense fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6"
          style={{ backdropFilter: "blur(40px)", background: "var(--bg-base)" }}
        >
          {/* Progress ring */}
          <div className="relative">
            <svg width="112" height="112" className="-rotate-90">
              <circle cx="56" cy="56" r="44" fill="none" stroke="var(--color-border)" strokeWidth="3" />
              <motion.circle
                cx="56" cy="56" r="44" fill="none"
                stroke="url(#preloader-grad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C - (progress / 100) * C}
                style={{ transition: "stroke-dashoffset 0.05s linear" }}
              />
              <defs>
                <linearGradient id="preloader-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-purple)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Logo inside ring */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Image src="/logo.png" alt="TamalData" width={52} height={52} className="rounded-xl" priority />
            </motion.div>
          </div>

          {/* Brand name shimmer */}
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-gradient font-heading text-xl tracking-tight"
          >
            TamalData
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
