"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NetworkCard } from "@/components/ui/NetworkCard";
import { NETWORK_AVAILABLE } from "@/lib/staticBundles";
import type { Network, NetworkStatus } from "@/types";

interface NetworkTeaserProps {
  statuses: NetworkStatus[];
  cheapestPrices: Partial<Record<Network, number>>;
}

export function NetworkTeaser({ statuses, cheapestPrices }: NetworkTeaserProps) {
  const router = useRouter();
  const networks: Network[] = ["MTN", "TELECEL", "AIRTELTIGO"];

  return (
    <section className="cinematic section-padding relative overflow-hidden">

      <div className="container-content relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
            className="text-center mb-12"
        >
          <h2 className="font-heading text-text-primary text-5xl md:text-6xl leading-tight mb-4">
            Every Network. One Platform.
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto font-barlow font-light">
            Cheapest bundles across all major Ghana networks — live, fast delivery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {networks.map((network, i) => {
            const statusObj = statuses.find((s) => s.network === network);
            return (
              <motion.div
                key={network}
                initial={{ opacity: 0, rotateY: -15, y: 24 }}
                whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <NetworkCard
                  network={network}
                  cheapestPrice={cheapestPrices[network]}
                  isOperational={statusObj?.status === "OPERATIONAL"}
                  outOfStock={!NETWORK_AVAILABLE[network]}
                  onSelect={(net) => NETWORK_AVAILABLE[net] && router.push(`/buy?network=${net}`)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
