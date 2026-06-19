"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import type { Network, DataBundle } from "@/types";

const NETWORK_COLOR: Record<string, string> = { MTN: "#FFCB00", TELECEL: "#E30613", AIRTELTIGO: "#9333EA" };

interface ShopProps {
  shop: { slug: string; displayName: string; bio?: string; whatsapp?: string; totalSales: number; agentId: string };
  networks: Network[];
  bundles: Record<string, DataBundle[]>;
}

export function ShopClient({ shop, networks, bundles }: ShopProps) {
  const [activeNet, setActiveNet] = useState<Network>(networks[0]);
  const [selectedDataBundle, setSelectedDataBundle] = useState<DataBundle | null>(null);
  const [phone, setPhone]     = useState("");
  const [step, setStep]       = useState<"browse" | "checkout" | "pending" | "success">("browse");
  const [loading, setLoading] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [error, setError]     = useState("");

  const displayDataBundles = bundles[activeNet] ?? [];

  async function handleCheckout() {
    if (!selectedDataBundle || !/^0[2345]\d{8}$/.test(phone)) {
      setError("Enter a valid Ghana number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Get the customer's MoMo network from the phone prefix
      const getNetworkFromPhone = (phone: string): Network => {
        const prefix = phone.substring(0, 3);
        if (prefix === "024" || prefix === "054" || prefix === "055" || prefix === "059") return "MTN";
        if (prefix === "020" || prefix === "050") return "TELECEL";
        if (prefix === "026" || prefix === "027" || prefix === "056" || prefix === "057") return "AIRTELTIGO";
        return activeNet; // Fallback to selected network
      };
      
      const payerNetwork = getNetworkFromPhone(phone);
      
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network:       activeNet,
          bundleId:      selectedDataBundle.id,
          bundleSize:    selectedDataBundle.size,
          bundleValidity: selectedDataBundle.validity,
          costPrice:     selectedDataBundle.price,
          sellPrice:     selectedDataBundle.price,
          recipientPhone: phone,
          paymentMethod: "MOMO",
          payerPhone:    phone,
          payerNetwork:  payerNetwork,
          agentId:       shop.agentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.error ?? data.message ?? "Order failed"); 
        return; 
      }
      setOrderRef(data.reference);
      if (data.status === "PENDING") {
        setStep("pending");
      } else {
        setStep("success");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base py-10 px-4">
      {/* Shop header */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent-primary/10 text-3xl mb-4">🛍️</div>
        <h1 className="font-heading text-3xl text-text-primary">{shop.displayName}</h1>
        {shop.bio && <p className="text-text-secondary mt-2">{shop.bio}</p>}
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-xs text-text-muted">{shop.totalSales} orders fulfilled</span>
          {shop.whatsapp && (
            <a href={`https://wa.me/233${shop.whatsapp.slice(1)}`} target="_blank" rel="noreferrer"
              className="text-xs text-emerald-400 hover:underline">WhatsApp →</a>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {step === "success" ? (
          <GlassPanel className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-heading text-2xl text-text-primary mb-2">Order Delivered!</h2>
            <p className="text-text-secondary mb-4">Your data bundle has been delivered.</p>
            <p className="font-mono text-sm text-accent-primary mb-6">{orderRef}</p>
            <a href={`/track?ref=${orderRef}`} className="text-sm text-accent-primary hover:underline">Track your order →</a>
          </GlassPanel>
        ) : step === "pending" ? (
          <GlassPanel className="p-8 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="font-heading text-2xl text-text-primary mb-2">Payment Pending</h2>
            <p className="text-text-secondary mb-4">Please approve the payment prompt on your phone.</p>
            <p className="font-mono text-sm text-accent-primary mb-6">{orderRef}</p>
          </GlassPanel>
        ) : step === "checkout" ? (
          <GlassPanel className="p-6 max-w-md mx-auto">
            <button onClick={() => setStep("browse")} className="text-xs text-text-muted hover:text-text-primary mb-4 flex items-center gap-1">
              ← Back to bundles
            </button>
            <h2 className="font-heading text-xl text-text-primary mb-4">Complete Order</h2>
            <div className="p-4 rounded-xl bg-bg-elevated/30 border border-color-border mb-4">
              <p className="text-xs text-text-muted">Selected bundle</p>
              <p className="font-heading text-text-primary">{selectedDataBundle?.size}</p>
              <p className="text-accent-primary font-semibold">GH₵{selectedDataBundle?.price.toFixed(2)}</p>
            </div>
            <div className="mb-4">
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Your Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0244000000"
                className="w-full bg-bg-elevated/30 border border-color-border rounded-xl px-4 py-3 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 transition-all"
              />
            </div>
            <GlassPanel className="p-3 mb-4 text-xs text-text-secondary text-center">
              <p>You will receive a payment prompt on your MoMo. Approve to complete the purchase.</p>
            </GlassPanel>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <GlowButton onClick={handleCheckout} disabled={loading} className="w-full">
              {loading ? "Processing..." : `Pay GH₵${selectedDataBundle?.price.toFixed(2)} via MoMo`}
            </GlowButton>
          </GlassPanel>
        ) : (
          <>
            {/* Network tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {networks.map((net) => (
                <button key={net} onClick={() => { setActiveNet(net); setSelectedDataBundle(null); }}
                  className="px-4 py-2 rounded-btn text-sm font-semibold transition-all"
                  style={activeNet === net
                    ? { backgroundColor: NETWORK_COLOR[net], color: net === "MTN" ? "#1A1200" : "#fff" }
                    : { border: "1px solid var(--color-border)", color: "var(--text-secondary)" }}>
                  {net === "AIRTELTIGO" ? "AirtelTigo" : net}
                </button>
              ))}
            </div>

            {/* DataBundle grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {displayDataBundles.map((b, i) => (
                <motion.button
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedDataBundle(b)}
                  className="p-4 rounded-xl border text-left transition-all"
                  style={{
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(16px)",
                    borderColor: selectedDataBundle?.id === b.id ? NETWORK_COLOR[activeNet] : "var(--color-border)",
                    boxShadow: selectedDataBundle?.id === b.id ? `0 0 0 2px ${NETWORK_COLOR[activeNet]}40` : undefined,
                  }}>
                  <p className="font-heading text-text-primary">{b.size}</p>
                  <p className="text-xs text-text-muted mt-0.5">{b.validity}</p>
                  <p className="font-semibold mt-2" style={{ color: NETWORK_COLOR[activeNet] }}>GH₵{b.price.toFixed(2)}</p>
                </motion.button>
              ))}
            </div>

            {selectedDataBundle && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <GlowButton onClick={() => setStep("checkout")} className="w-full">
                  Buy {selectedDataBundle.size} for GH₵{selectedDataBundle.price.toFixed(2)} →
                </GlowButton>
              </motion.div>
            )}
          </>
        )}
      </div>

      <p className="text-center text-xs text-text-muted mt-10">
        Powered by <span className="text-accent-primary font-semibold">TamalData</span>
      </p>
    </div>
  );
}
