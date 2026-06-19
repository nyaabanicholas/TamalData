"use client";

import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/GlowButton";
import { TrendingUp, Rocket, Award } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const features = [
  {
    icon: Rocket,
    title: "Fast Start",
    description: "Set up your store in minutes with our guided wizard",
  },
  {
    icon: TrendingUp,
    title: "Earn Daily",
    description: "Sell data bundles and earn profit on every sale",
  },
  {
    icon: Award,
    title: "Premium Features",
    description: "Custom pricing, your own storefront, and more",
  },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-4 liquid-glass rounded-full px-4 py-2">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-primary">Reseller Program</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-4">
          Welcome to the Reseller Program
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto font-barlow leading-relaxed">
          Join Ghana&apos;s fastest-growing data reseller network. Buy at wholesale prices,
          set your own margins, and build your customer base with TamalData&apos;s powerful platform.
        </p>
      </motion.div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            className="liquid-glass rounded-2xl p-6 text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-accent-primary/15 flex items-center justify-center mb-4">
              <feature.icon className="h-6 w-6 text-accent-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">{feature.title}</h3>
            <p className="text-sm text-text-secondary font-barlow">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      >
        <GlowButton onClick={onNext} size="lg">
          Get Started →
        </GlowButton>
        <p className="mt-4 text-sm text-text-muted font-barlow">
          This will only take a few minutes to complete
        </p>
      </motion.div>
    </div>
  );
}
