"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Loader2, CheckCircle2, Info } from "lucide-react";
import { isTestMode, PAYSTACK_TEST_NUMBERS } from "@/lib/paystack";
import type { Network } from "@/types";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NETWORKS: { id: Network; label: string }[] = [
  { id: "MTN", label: "MTN MoMo" },
  { id: "TELECEL", label: "Telecel Cash" },
  { id: "AIRTELTIGO", label: "AirtelTigo Money" },
];

const GHANA_PHONE = /^0[2345][0-9]{8}$/;

type Step = "idle" | "loading" | "awaiting" | "done" | "error";

export function DepositModal({ open, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount]   = useState("");
  const [phone, setPhone]     = useState("");
  const [network, setNetwork] = useState<Network>("MTN");
  const [step, setStep]       = useState<Step>("idle");
  const [prompt, setPrompt]   = useState("");
  const [error, setError]     = useState("");

  const valid = Number(amount) >= 1 && GHANA_PHONE.test(phone);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const depositRef = useRef<string | null>(null);

  const handleDeposit = async () => {
    if (!valid || step === "loading" || step === "awaiting") return;
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), phone, network }),
      });
      const data = (await res.json()) as { error?: string; display_text?: string; reference?: string; status?: string; amount?: number };
      if (!res.ok) throw new Error(data.error ?? "Deposit failed");
      
      depositRef.current = data.reference ?? null;
      
      // Test mode: deposit completes immediately — skip polling
      if (data.status === "completed") {
        setStep("done");
        return;
      }
      
      // Live mode: wait for user to approve on phone, poll for webhook
      setStep("awaiting");
      setPrompt(data.display_text ?? "Approve the payment prompt on your phone.");
      
      // Start polling for deposit completion
      startPolling(data.reference!);
    } catch (e) {
      setStep("error");
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    }
  };

  const startPolling = (ref: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/wallet/deposit/status?ref=${encodeURIComponent(ref)}`);
        const data = (await res.json()) as { status: string; amount?: number };
        if (data.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("done");
        }
      } catch {
        // transient — keep polling
      }
      // Stop polling after ~2 minutes (40 × 3s)
      if (tries >= 40 && pollRef.current) {
        clearInterval(pollRef.current);
      }
    }, 3000);
  };

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep("idle");
    setError("");
    setAmount("");
    setPhone("");
    depositRef.current = null;
    onClose();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Auto-fill test phone number on mount when in test mode
  useEffect(() => {
    if (isTestMode() && open && PAYSTACK_TEST_NUMBERS[network]) {
      setPhone(PAYSTACK_TEST_NUMBERS[network]);
    }
  }, [open, network]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="deposit-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(var(--section-fade-rgb), 0.7)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            key="deposit-modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-strong w-full max-w-md rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 id="deposit-title" className="font-heading text-xl text-text-primary">Deposit Funds</h2>
                <p className="text-text-muted text-xs font-barlow mt-0.5">Mobile Money → wallet credit</p>
              </div>
              <button onClick={handleClose} className="liquid-glass rounded-full p-2 text-text-muted hover:text-text-primary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === "done" ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle2 className="h-12 w-12 text-color-success" strokeWidth={1.5} />
                <p className="font-semibold text-text-primary">Deposit successful!</p>
                <p className="text-text-muted text-sm">Your wallet balance has been updated.</p>
                <button onClick={() => { onSuccess?.(); handleClose(); }} className="mt-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--gradient-cta)" }}>
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Amount (GH₵)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 20"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={step === "loading" || step === "awaiting"}
                    className="w-full rounded-xl bg-bg-elevated border border-color-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40 disabled:opacity-60"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                    MoMo Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={step === "loading" || step === "awaiting"}
                    className="w-full rounded-xl bg-bg-elevated border border-color-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40 disabled:opacity-60"
                  />
                </div>

                {/* Network */}
                <div className="grid grid-cols-3 gap-2">
                  {NETWORKS.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setNetwork(n.id);
                        // Auto-fill test phone number in test mode
                        if (isTestMode() && PAYSTACK_TEST_NUMBERS[n.id]) {
                          setPhone(PAYSTACK_TEST_NUMBERS[n.id]);
                        }
                      }}
                      disabled={step === "loading" || step === "awaiting"}
                      className={`rounded-xl px-2 py-2.5 text-[11px] font-barlow font-semibold transition-all disabled:opacity-60 ${
                        network === n.id
                          ? "liquid-glass-strong text-text-primary ring-2 ring-accent-primary/50"
                          : "liquid-glass text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>

                {/* Awaiting prompt */}
                {step === "awaiting" && prompt && (
                  <div className="flex items-center gap-2 rounded-xl liquid-glass px-3 py-2.5">
                    <Smartphone className="h-4 w-4 text-accent-primary shrink-0 animate-pulse" />
                    <p className="text-xs text-text-secondary font-barlow leading-snug">{prompt}</p>
                  </div>
                )}

                {/* Test mode indicator */}
                {isTestMode() && step === "idle" && (
                  <div className="flex items-center gap-2 rounded-xl bg-accent-primary/5 border border-accent-primary/20 px-3 py-2.5">
                    <Info className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                    <p className="text-[11px] text-accent-primary font-barlow">
                      Test mode — auto-fills test number when you pick a network
                    </p>
                  </div>
                )}

                {error && <p className="text-xs text-color-error font-barlow">{error}</p>}

                <button
                  onClick={handleDeposit}
                  disabled={!valid || step === "loading" || step === "awaiting"}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  {step === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> :
                   step === "awaiting" ? <><Loader2 className="h-4 w-4 animate-spin" /> Awaiting approval…</> :
                   `Deposit GH₵${amount || "0"}`}
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
