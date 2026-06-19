"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Smartphone, Loader2, CheckCircle2, ArrowUpRight, Info } from "lucide-react";
import { PAYSTACK_TEST_NUMBERS, isTestMode } from "@/lib/paystack";

type PaymentMethod = "WALLET" | "MOMO";

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  phone: string;
  network: string;
  bundleId: string;
  bundleSize: string;
  bundleValidity: string;
  costPrice: number;
  userId?: string;
  onSuccess: (ref: string) => void;
}

export function PaymentMethodModal({
  open, onClose, amount, description, phone, network,
  bundleId, bundleSize, bundleValidity, costPrice, userId,
  onSuccess,
}: PaymentMethodModalProps) {
  const isAuthenticated = !!userId;
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"select" | "processing" | "success" | "error">("select");
  const [error, setError] = useState("");
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const handlePay = async () => {
    if (!method) return;
    setStep("processing");
    setError("");

    try {
      if (method === "WALLET" && !userId) {
        setError("Sign in to pay from your wallet.");
        setStep("error");
        return;
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          bundleId,
          bundleSize,
          bundleValidity,
          costPrice,
          phone,
          userId,
          paymentMethod: method,
          ...(method === "MOMO" ? { payerPhone: phone, payerNetwork: network } : {}),
        }),
      });

      const data = await res.json() as {
        error?: string; reference?: string; status?: string; display_text?: string;
      };

      if (!res.ok) throw new Error(data.error ?? "Payment failed");

      if (method === "WALLET" && data.status === "DELIVERED") {
        setOrderRef(data.reference!);
        setStep("success");
        setTimeout(() => onSuccess(data.reference!), 1500);
        return;
      }

      // MOMO — show awaiting state
      setOrderRef(data.reference!);
      setStep("success");
      onSuccess(data.reference!);
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(var(--section-fade-rgb), 0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && step === "select") onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-strong w-full max-w-sm rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg text-text-primary">Choose Payment Method</h2>
              <button onClick={onClose} className="liquid-glass rounded-full p-1.5 text-text-muted hover:text-text-primary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === "select" && (
              <>
                <p className="text-sm text-text-secondary font-barlow mb-4">
                  {description} — <span className="font-semibold text-text-primary">GH₵{amount.toFixed(2)}</span>
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => { if (isAuthenticated) setMethod("WALLET"); }}
                    disabled={!isAuthenticated}
                    className={`w-full liquid-glass rounded-xl p-4 text-left transition-all ${
                      method === "WALLET" ? "ring-2 ring-accent-primary/50" : ""
                    } ${!isAuthenticated ? "opacity-40 cursor-not-allowed" : "hover:border-accent-primary/30 cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-accent-primary/15 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-accent-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-text-primary">Wallet Balance</p>
                        <p className="text-xs text-text-muted font-barlow">
                          {isAuthenticated ? "Pay from your TamalData wallet" : "Sign in to use your wallet"}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setMethod("MOMO"); }}
                    className={`w-full liquid-glass rounded-xl p-4 text-left transition-all ${
                      method === "MOMO" ? "ring-2 ring-accent-primary/50" : "hover:border-accent-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-accent-orange/15 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-accent-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-text-primary">Mobile Money</p>
                        <p className="text-xs text-text-muted font-barlow">Pay with MTN MoMo, Telecel Cash, or AirtelTigo Money</p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Show test numbers in test mode */}
                  {isTestMode() && method === "MOMO" && (
                    <div className="mt-3 p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/20">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-accent-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-accent-primary mb-1">Test Mode Active</p>
                          <p className="text-xs text-text-secondary font-barlow mb-2">Use these test numbers:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(PAYSTACK_TEST_NUMBERS).map(([net, num]) => (
                              <div key={net} className="text-center">
                                <p className="text-xs font-semibold" style={{ color: net === "MTN" ? "#FFCB00" : net === "TELECEL" ? "#E30613" : "#9333EA" }}>
                                  {net === "AIRTELTIGO" ? "AirtelTigo" : net}
                                </p>
                                <p className="text-xs font-mono text-text-secondary">{num}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePay}
                  disabled={!method}
                  className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  {method === "WALLET" ? "Pay with Wallet" : method === "MOMO" ? "Pay with Mobile Money" : "Select a method"}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-10 w-10 text-accent-primary animate-spin" />
                <p className="text-text-primary font-semibold">
                  {method === "WALLET" ? "Processing wallet payment..." : "Initiating mobile money payment..."}
                </p>
                <p className="text-text-muted text-xs font-barlow">Please wait</p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="h-12 w-12 text-color-success" strokeWidth={1.5} />
                <p className="font-semibold text-text-primary">
                  {method === "WALLET" ? "Payment successful!" : "Payment initiated!"}
                </p>
                <p className="text-text-muted text-xs font-barlow text-center">
                  {method === "WALLET"
                    ? "Data is being delivered to your number."
                    : "Approve the prompt on your phone to complete payment."}
                </p>
                {orderRef && (
                  <p className="text-[10px] font-mono text-text-muted">Ref: {orderRef}</p>
                )}
                <button
                  onClick={() => { onSuccess(orderRef ?? ""); onClose(); }}
                  className="mt-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  Done
                </button>
              </div>
            )}

            {step === "error" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="h-12 w-12 rounded-full bg-color-error/10 flex items-center justify-center">
                  <X className="h-6 w-6 text-color-error" />
                </div>
                <p className="font-semibold text-text-primary">Payment failed</p>
                <p className="text-xs text-color-error font-barlow text-center">{error}</p>
                {isTestMode() && error?.toLowerCase().includes("test") && (
                  <div className="mt-3 p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/20 w-full">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-accent-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-accent-primary mb-1">Use Test Numbers</p>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(PAYSTACK_TEST_NUMBERS).map(([net, num]) => (
                            <div key={net} className="text-center">
                              <p className="text-xs font-semibold" style={{ color: net === "MTN" ? "#FFCB00" : net === "TELECEL" ? "#E30613" : "#9333EA" }}>
                                {net === "AIRTELTIGO" ? "Airtel" : net}
                              </p>
                              <p className="text-xs font-mono text-text-secondary">{num}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => { setStep("select"); setError(""); }}
                  className="mt-2 liquid-glass rounded-xl px-5 py-2 text-sm font-semibold text-text-primary"
                >
                  Try again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
