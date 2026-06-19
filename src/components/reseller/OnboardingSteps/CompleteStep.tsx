"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { CheckCircle, Copy, ExternalLink, Store, Rocket, Award } from "lucide-react";

interface CompleteStepProps {
  slug: string;
  onContinue: () => void;
}

export function CompleteStep({ slug, onContinue }: CompleteStepProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const storeUrl = `${window.location.origin}/shop/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = storeUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextSteps = [
    {
      icon: Store,
      title: "Customize Your Store",
      description: "Add your logo, branding colors, and more details to make it yours",
    },
    {
      icon: Rocket,
      title: "Fund Your Wallet",
      description: "Add money to your reseller wallet to start selling",
    },
    {
      icon: Award,
      title: "Start Selling",
      description: "Share your store link and start earning money today",
    },
  ];

  return (
    <div className="text-center py-8">
      {/* Success Animation */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div
            className="h-20 w-20 mx-auto mb-4 rounded-full bg-color-success/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <CheckCircle className="h-10 w-10 text-color-success" strokeWidth={2} />
          </motion.div>
          
          {/* Confetti effect using simple dots */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-accent-primary"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, y: -100 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: [0, Math.random() * 200 - 100, Math.random() * 200],
                x: Math.random() * 200 - 100,
              }}
              transition={{ 
                duration: 1 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-4 liquid-glass rounded-full px-4 py-2">
          <CheckCircle className="h-4 w-4 text-color-success" />
          <span className="text-xs font-bold uppercase tracking-widest text-color-success">Complete</span>
        </div>
        <h2 className="font-heading text-4xl md:text-5xl text-text-primary mb-4">
          Your Store is Live! 🎉
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto font-barlow leading-relaxed">
          Congratulations! Your TamalData reseller store has been successfully created.
          You can now share your unique store link with customers and start selling data bundles.
        </p>
      </motion.div>

      {/* Store Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-10"
      >
        <GlassPanel className="p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-accent-primary/15 flex items-center justify-center">
              <ExternalLink className="h-5 w-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Your Store Link</h3>
              <p className="text-xs text-text-muted font-barlow">Share this with your customers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={storeUrl}
              readOnly
              className="flex-1 bg-bg-elevated border border-color-border rounded-xl px-4 py-2.5 text-sm font-mono text-text-primary"
            />
            <GlowButton onClick={handleCopy} size="sm">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </GlowButton>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10"
      >
        {nextSteps.map((step) => (
          <GlassPanel key={step.title} className="p-6 text-left">
            <div className="h-10 w-10 rounded-xl bg-accent-primary/15 flex items-center justify-center mb-4">
              <step.icon className="h-5 w-5 text-accent-primary" />
            </div>
            <h4 className="font-semibold text-text-primary mb-2">{step.title}</h4>
            <p className="text-sm text-text-secondary font-barlow">{step.description}</p>
          </GlassPanel>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <GlowButton onClick={onContinue} size="lg">
          Go to Reseller Dashboard →
        </GlowButton>
      </motion.div>
    </div>
  );
}
