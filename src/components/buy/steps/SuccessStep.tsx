"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useBuyStore } from "@/store/useBuyStore";
import { GlowButton } from "@/components/ui/GlowButton";
import Link from "next/link";
import { CheckCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

export function SuccessStep() {
  const { orderRef, bundle, network, reset } = useBuyStore();
  const [copied, setCopied] = useState(false);
  const hasConfetti = useRef(false);

  useEffect(() => {
    if (hasConfetti.current) return;
    hasConfetti.current = true;
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    });
  }, []);

  function copyRef() {
    if (!orderRef) return;
    navigator.clipboard.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="h-20 w-20 rounded-full bg-color-success/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-color-success" />
          </div>
        </motion.div>

        <h2 className="font-heading font-bold text-3xl text-text-primary mb-3">
          Order Placed!
        </h2>
        <p className="text-text-secondary mb-6 font-barlow">
          {bundle?.size ? `${bundle.size} ${network} data is on its way to your number.` : "Your data is on its way."}
          {" "}Usually arrives within{" "}
          <span className="text-text-primary font-semibold">2 minutes</span>.
        </p>

        {orderRef && (
          <div className="mb-8 p-4 rounded-[1.25rem] liquid-glass-strong">
            <p className="text-xs text-text-muted mb-2 font-barlow">Order Reference</p>
            <div className="flex items-center justify-between gap-3">
              <code className="font-mono text-text-primary text-sm">{orderRef}</code>
              <button
                onClick={copyRef}
                className="text-text-muted hover:text-text-primary transition-colors"
                title="Copy reference"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-color-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/track?ref=${orderRef}`}>
            <GlowButton className="w-full sm:w-auto">Track Order</GlowButton>
          </Link>
          <GlowButton variant="ghost" onClick={reset} className="w-full sm:w-auto">
            Buy Another
          </GlowButton>
        </div>
      </motion.div>
    </div>
  );
}
