"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { NetworkCard } from "@/components/ui/NetworkCard";
import { PaymentMethodModal } from "@/components/ui/PaymentMethodModal";
import type { Network, DataBundle } from "@/types";

const GHANA_PHONE = /^0[2345][0-9]{8}$/;
const NETWORKS: Network[] = ["MTN", "TELECEL", "AIRTELTIGO"];

type Step = "network" | "bundle" | "phone" | "success";

interface DashboardQuickBuyProps {
  userId?: string;
}

export function DashboardQuickBuy({ userId }: DashboardQuickBuyProps) {
  const [step, setStep] = useState<Step>("network");
  const [network, setNetwork] = useState<Network | null>(null);
  const [bundles, setBundles] = useState<DataBundle[]>([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<DataBundle | null>(null);
  const [phone, setPhone] = useState("");
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Fetch bundles when network is selected
  useEffect(() => {
    if (!network) return;
    setStep("bundle");
    setSelectedBundle(null);
    setLoadingBundles(true);
    setFetchError(null);

    fetch(`/api/bundles?network=${network}`)
      .then((r) => r.json())
      .then((data: DataBundle[] | { bundles?: DataBundle[] }) => {
        const list = Array.isArray(data) ? data : (data.bundles ?? []);
        setBundles(list);
        if (list.length === 0) setFetchError("No bundles available");
      })
      .catch(() => setFetchError("Could not load bundles"))
      .finally(() => setLoadingBundles(false));
  }, [network]);

  const handleSelectNetwork = useCallback((net: Network) => {
    setNetwork(net);
    setPhone("");
    setOrderRef(null);
  }, []);

  const handleSelectBundle = useCallback((bundle: DataBundle) => {
    setSelectedBundle(bundle);
    setStep("phone");
  }, []);

  const pollStatus = (reference: string) => {
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries++;
      try {
        const r = await fetch(`/api/order/${reference}`);
        const d = (await r.json()) as { status?: string };
        if (d.status === "DELIVERED" || d.status === "PROCESSING") {
          if (pollRef.current) clearInterval(pollRef.current);
          setOrderRef(reference);
          setStep("success");
        }
      } catch {
        /* transient — keep polling */
      }
      if (tries >= 50 && pollRef.current) {
        clearInterval(pollRef.current);
        setOrderRef(reference);
        setStep("success");
      }
    }, 3000);
  };

  const handlePay = () => {
    if (!network || !selectedBundle || !GHANA_PHONE.test(phone)) return;
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (ref: string) => {
    setPaymentModalOpen(false);
    setOrderRef(ref);
    setStep("success");
    pollStatus(ref);
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep("network");
    setNetwork(null);
    setSelectedBundle(null);
    setPhone("");
    setOrderRef(null);
    setBundles([]);
  };

  return (
    <GlassPanel className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-color-border/30">
        <div className="h-8 w-8 rounded-lg bg-accent-primary/15 flex items-center justify-center">
          <Zap className="h-4 w-4 text-accent-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-base text-text-primary">Quick Buy</h3>
          <p className="text-xs text-text-muted font-barlow">Buy data in minutes</p>
        </div>
      </div>

      <div className="p-5 min-h-[180px]">
        <AnimatePresence mode="wait">
          {/* Step: Pick network */}
          {step === "network" && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-xs font-barlow font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Select network
              </p>
              <div className="grid grid-cols-3 gap-3">
                {NETWORKS.map((net) => (
                  <NetworkCard
                    key={net}
                    network={net}
                    selected={false}
                    onSelect={() => handleSelectNetwork(net)}
                    compact
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Pick bundle */}
          {step === "bundle" && (
            <motion.div
              key="bundle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-barlow font-semibold text-text-secondary uppercase tracking-wider">
                  Choose bundle
                </p>
                <button
                  onClick={() => { setNetwork(null); setStep("network"); }}
                  className="text-xs text-accent-primary hover:underline font-barlow"
                >
                  Change
                </button>
              </div>

              {loadingBundles && (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl skeleton" />
                  ))}
                </div>
              )}

              {fetchError && (
                <p className="text-xs text-color-error font-barlow">{fetchError}</p>
              )}

              {!loadingBundles && !fetchError && (
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                  {bundles.filter((b) => b.available).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBundle(b)}
                      className="liquid-glass rounded-xl p-3 text-left transition-all hover:border-accent-primary/30 active:scale-[0.98] flex flex-col gap-0.5"
                    >
                      <span className="font-heading font-bold text-sm text-text-primary">
                        {b.size}
                      </span>
                      <span className="font-barlow text-xs text-text-muted">
                        GH₵{b.price.toFixed(2)}
                      </span>
                      <span className="font-barlow text-[10px] text-text-muted/60">
                        {b.validity}
                      </span>
                    </button>
                  ))}
                  {bundles.filter((b) => b.available).length === 0 && (
                    <p className="col-span-2 text-xs text-text-muted font-barlow py-4 text-center">
                      No bundles available
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Enter phone + Pay */}
          {step === "phone" && selectedBundle && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-barlow font-semibold text-text-secondary uppercase tracking-wider">
                    {network} {selectedBundle.size}
                  </p>
                  <p className="font-heading font-bold text-lg text-text-primary">
                    GH₵{selectedBundle.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedBundle(null); setStep("bundle"); }}
                  className="text-xs text-accent-primary hover:underline font-barlow"
                >
                  Change
                </button>
              </div>

              <input
                type="tel"
                inputMode="numeric"
                placeholder="0XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                autoFocus
                className="w-full rounded-xl bg-bg-elevated border border-color-border px-4 py-2.5 text-sm font-barlow text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all"
              />

              <button
                onClick={handlePay}
                disabled={!GHANA_PHONE.test(phone)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay GH₵{selectedBundle.price.toFixed(2)}
              </button>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <CheckCircle className="h-10 w-10 text-color-success" />
              <div className="text-center">
                <p className="font-heading font-bold text-base text-text-primary">Order placed!</p>
                <p className="text-xs text-text-muted font-barlow mt-1">
                  Ref: {orderRef}
                </p>
                <p className="text-xs text-text-muted font-barlow">
                  {selectedBundle?.size} → {phone}
                </p>
              </div>
              <button
                onClick={reset}
                className="mt-1 liquid-glass rounded-full px-5 py-2 text-xs font-semibold font-barlow text-text-primary hover:text-accent-primary transition-colors"
              >
                Buy Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment method modal */}
      {selectedBundle && network && (
        <PaymentMethodModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          amount={selectedBundle.price}
          description={`${selectedBundle.size} — ${network}`}
          phone={phone}
          network={network}
          bundleId={selectedBundle.id}
          bundleSize={selectedBundle.size}
          bundleValidity={selectedBundle.validity}
          userId={userId}
          costPrice={selectedBundle.price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </GlassPanel>
  );
}
