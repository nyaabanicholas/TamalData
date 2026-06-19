"use client";

import { motion } from "framer-motion";
import { NetworkCard } from "@/components/ui/NetworkCard";
import { useBuyStore } from "@/store/useBuyStore";
import { CHEAPEST_BY_NETWORK, NETWORK_AVAILABLE } from "@/lib/staticBundles";
import type { Network } from "@/types";

const NETWORKS: Network[] = ["MTN", "TELECEL", "AIRTELTIGO"];

export function NetworkStep() {
  const { network, setNetwork } = useBuyStore();

  return (
    <div className="flex flex-col items-center text-center py-4 relative rounded-3xl overflow-visible">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10 relative z-10 liquid-glass-strong rounded-2xl px-6 py-4"
      >
        <h2 className="font-heading text-3xl text-text-primary mb-2">
          Choose Your Network
        </h2>
        <p className="text-text-secondary max-w-sm mx-auto font-barlow font-medium">
          Select the network you want to top up. Data is delivered in under 1 hour.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl mx-auto relative z-10">
        {NETWORKS.map((net, i) => (
          <motion.div
            key={net}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <NetworkCard
              network={net}
              cheapestPrice={CHEAPEST_BY_NETWORK[net]}
              selected={network === net}
              outOfStock={!NETWORK_AVAILABLE[net]}
              onSelect={setNetwork}
            />
          </motion.div>
        ))}
      </div>

      {!network && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-text-secondary relative z-10 liquid-glass px-4 py-2 rounded-full font-barlow font-medium"
        >
          Tap a network card to continue
        </motion.p>
      )}
    </div>
  );
}
