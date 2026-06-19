"use client";

import { useEffect } from "react";
import { useBuyStore } from "@/store/useBuyStore";
import { NetworkStep } from "./steps/NetworkStep";
import { SuccessStep } from "./steps/SuccessStep";
import { InlineBundleGrid } from "./InlineBundleGrid";
import { motion, AnimatePresence } from "framer-motion";
import type { Network } from "@/types";

interface BuyWizardProps {
  defaultNetwork?: Network;
}

export function BuyWizard({ defaultNetwork }: BuyWizardProps) {
  const { step, network, setNetwork } = useBuyStore();

  useEffect(() => {
    if (defaultNetwork) setNetwork(defaultNetwork);
  }, [defaultNetwork, setNetwork]);

  return (
    <div className="pb-20">
      <div className="container-content">
        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
            >
              <SuccessStep />
            </motion.div>
          ) : step === "bundle" && network ? (
            <motion.div
              key="bundle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <InlineBundleGrid />
            </motion.div>
          ) : (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <NetworkStep />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
