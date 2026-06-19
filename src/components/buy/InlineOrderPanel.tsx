"use client";

import { useState, useEffect } from "react";
import { useBuyStore } from "@/store/useBuyStore";
import { PaymentMethodModal } from "@/components/ui/PaymentMethodModal";
import { PAYSTACK_TEST_NUMBERS, isTestMode } from "@/lib/paystack";
import type { DataBundle } from "@/types";

const GHANA_PHONE = /^0[2345][0-9]{8}$/;

interface InlineOrderPanelProps {
  bundle: DataBundle;
  /** True DataMart cost (for profit tracking). Falls back to bundle.price. */
  costPrice?: number;
}

export function InlineOrderPanel({ bundle, costPrice }: InlineOrderPanelProps) {
  const { setOrderRef, setBundle } = useBuyStore();
  const [phone, setPhone] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<string | null>(null);

  const valid = GHANA_PHONE.test(phone);

  // Check auth state on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then(r => r.json()).catch(() => ({}));
        if (me?.user?.id) setSessionUser(me.user.id);
      } catch { /* guest */ }
    })();
  }, []);

  // Auto-fill test phone number in test mode
  useEffect(() => {
    if (isTestMode() && PAYSTACK_TEST_NUMBERS[bundle.network]) {
      setPhone(PAYSTACK_TEST_NUMBERS[bundle.network]);
    }
  }, [bundle.network]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  // Always show PaymentMethodModal — Wallet is grayed out for guests
  const handlePay = () => {
    if (!valid) return;
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (ref: string) => {
    setPaymentModalOpen(false);
    setBundle(bundle);
    setOrderRef(ref);
  };

  return (
    <>
      <div className="liquid-glass-strong rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs font-barlow font-semibold text-text-secondary uppercase tracking-wider">
          Recipient number
        </p>

        <input
          type="tel"
          inputMode="numeric"
          placeholder="0XX XXX XXXX"
          value={phone}
          onChange={handlePhoneChange}
          autoFocus
          className="w-full rounded-xl bg-bg-elevated border border-color-border px-4 py-2.5 text-sm font-barlow text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all"
        />

        <button
          type="button"
          onClick={handlePay}
          disabled={!valid}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pay GH₵{bundle.price.toFixed(2)}
        </button>
      </div>

      <PaymentMethodModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          amount={bundle.price}
          description={`${bundle.size} — ${bundle.network}`}
          phone={phone}
          network={bundle.network}
          bundleId={bundle.id}
          bundleSize={bundle.size}
          bundleValidity={bundle.validity}
          costPrice={costPrice ?? bundle.price}
          userId={sessionUser ?? undefined}
          onSuccess={handlePaymentSuccess}
        />
    </>
  );
}
