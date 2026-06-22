"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { BundleCard } from "@/components/ui/BundleCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { useRouter } from "next/navigation";
import { STATIC_BUNDLES } from "@/lib/staticBundles";
import type { Network, DataBundle } from "@/types";
import { X, BookUser, ChevronDown } from "lucide-react";
import { PaymentMethodModal } from "@/components/ui/PaymentMethodModal";

const TABS: { key: Network; label: string; color: string }[] = [
  { key: "MTN",        label: "MTN",        color: "#FFCB00" },
  { key: "TELECEL",    label: "Telecel",    color: "#E30613" },
  { key: "AIRTELTIGO", label: "AirtelTigo", color: "#9333EA" },
];

const GHANA_PHONE = /^0[2345][0-9]{8}$/;
interface SavedNumber { id: number; phone: string; label?: string | null }

function HomeBuyModal({ bundle, onClose }: { bundle: DataBundle; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [actualPrice, setActualPrice] = useState<number>(bundle.price);
  const [costPrice, setCostPrice] = useState<number>(bundle.price);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [savedNumbers, setSavedNumbers] = useState<SavedNumber[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [outOfStock, setOutOfStock] = useState(!bundle.available);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then(r => r.json()).catch(() => ({}));
        if (me?.user?.id) {
          setUserId(me.user.id);
          const nums = await fetch("/api/numbers").then(r => r.ok ? r.json() : []).catch(() => []);
          if (Array.isArray(nums)) setSavedNumbers(nums);
        }
      } catch { /* guest */ }
    })();
  }, []);

  useEffect(() => {
    fetch(`/api/bundles?network=${bundle.network}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; price: number; costPrice: number; available: boolean }[]) => {
        if (!Array.isArray(data)) return;
        const found = data.find(b => b.id === bundle.id);
        if (found) {
          setActualPrice(found.price);
          setCostPrice(found.costPrice);
          if (!found.available) setOutOfStock(true);
        }
      })
      .catch(() => {});
  }, [bundle.id, bundle.network]);

  const valid = GHANA_PHONE.test(phone);

  if (!mounted) return null;

  return (
    <>
      {createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(var(--section-fade-rgb), 0.72)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="liquid-glass-strong w-full max-w-sm rounded-2xl p-6"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-lg text-text-primary">Buy {bundle.size}</h2>
                  <p className="text-xs text-text-secondary font-barlow">{bundle.network} · {bundle.validity}</p>
                </div>
                <button onClick={onClose} className="liquid-glass rounded-full p-1.5 text-text-muted hover:text-text-primary transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {outOfStock ? (
                <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-sm font-semibold font-barlow" style={{ color: "var(--color-error)" }}>Out of Stock</p>
                  <p className="text-xs font-barlow mt-1" style={{ color: "var(--color-error)", opacity: 0.8 }}>
                    This bundle is temporarily unavailable. Please check back soon or choose a different bundle.
                  </p>
                </div>
              ) : done ? (
                <div className="text-center py-4">
                  <p className="text-4xl mb-2">✅</p>
                  <p className="font-semibold text-text-primary">Order placed!</p>
                  <p className="text-xs text-text-muted font-barlow mt-1">Data will be delivered to {phone}</p>
                  <button onClick={onClose} className="mt-4 liquid-glass rounded-xl px-5 py-2 text-sm font-semibold text-text-primary">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="liquid-glass rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm font-barlow text-text-secondary">Total</span>
                    <span className="font-heading text-xl text-text-primary">GH₵{actualPrice.toFixed(2)}</span>
                  </div>

                  <p className="text-xs font-barlow font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Recipient number
                  </p>

                  {savedNumbers.length > 0 && (
                    <div className="relative mb-2">
                      <button
                        type="button"
                        onClick={() => setShowSaved(v => !v)}
                        className="w-full flex items-center justify-between gap-2 rounded-xl bg-bg-elevated border border-color-border px-4 py-2 text-sm font-barlow text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookUser className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                          <span>Saved numbers</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showSaved ? "rotate-180" : ""}`} />
                      </button>
                      {showSaved && (
                        <div className="absolute top-full mt-1 left-0 right-0 z-20 liquid-glass rounded-xl overflow-hidden shadow-lg">
                          {savedNumbers.map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => { setPhone(n.phone); setShowSaved(false); }}
                              className="w-full px-4 py-2.5 text-left text-sm font-barlow text-text-primary hover:bg-accent-primary/10 transition-colors flex items-center justify-between"
                            >
                              <span className="font-mono">{n.phone}</span>
                              {n.label && <span className="text-xs text-text-muted">{n.label}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="0XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    autoFocus
                    className="w-full rounded-xl bg-bg-elevated border border-color-border px-4 py-2.5 text-sm font-barlow text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all mb-3"
                  />

                  <button
                    type="button"
                    onClick={() => valid && setPayModalOpen(true)}
                    disabled={!valid}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pay GH₵{actualPrice.toFixed(2)}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <PaymentMethodModal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        amount={actualPrice}
        description={`${bundle.size} — ${bundle.network}`}
        phone={phone}
        network={bundle.network}
        bundleId={bundle.id}
        bundleSize={bundle.size}
        bundleValidity={bundle.validity}
        costPrice={costPrice}
        userId={userId}
        onSuccess={(ref) => {
          setPayModalOpen(false);
          setDone(true);
          console.log("Order placed:", ref);
        }}
      />
    </>
  );
}

export function PricingPreview() {
  const [active, setActive] = useState<Network>("MTN");
  const [buyModal, setBuyModal] = useState<DataBundle | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const bundles = STATIC_BUNDLES[active].slice(0, 6);
  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${activeTab.color}1f 0%, transparent 70%)`,
          transition: "background 0.5s ease",
        }}
      />
      <div
        className="absolute top-1/4 -right-32 w-[600px] h-[600px] pointer-events-none opacity-20 dark:opacity-10"
        style={{
          background: `radial-gradient(circle at 40% 50%, ${activeTab.color}20 0%, transparent 70%)`,
          filter: "blur(100px)",
          transition: "all 0.5s ease",
        }}
      />

      <div className="container-content relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <span className="liquid-glass inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest mb-5 text-text-secondary font-barlow">
            Live Prices
          </span>
          <h2 className="font-heading text-text-primary text-xl sm:text-3xl md:text-4xl leading-tight mb-4">
            Ghana&apos;s Best Data Rates
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto font-barlow font-light">
            All bundles have 90-day validity. No hidden fees. Fast delivery.
          </p>
        </motion.div>

        {/* Network tabs — all clickable */}
        <div className="liquid-glass flex gap-2 justify-center mb-10 p-1.5 rounded-full w-fit mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className="relative px-5 py-2.5 rounded-full text-sm font-semibold font-barlow transition-all duration-200"
              style={
                active === tab.key
                  ? {
                      backgroundColor: tab.color,
                      color: tab.key === "MTN" ? "#1A1200" : "#fff",
                      boxShadow: `0 4px 20px ${tab.color}40`,
                    }
                  : { color: "var(--text-secondary)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10"
          >
            {bundles.map((bundle, i) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <BundleCard
                  bundle={bundle}
                  onSelect={() => setBuyModal(bundle)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="text-center">
          <GlowButton onClick={() => router.push(`/buy?network=${active}`)} size="lg">
            See All {STATIC_BUNDLES[active].length} Bundles →
          </GlowButton>
        </div>
      </div>

      {mounted && buyModal && (
        <HomeBuyModal
          bundle={buyModal}
          onClose={() => setBuyModal(null)}
        />
      )}
    </section>
  );
}
