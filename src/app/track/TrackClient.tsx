"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OrderTimeline } from "@/components/ui/OrderTimeline";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, RefreshCw, Copy, Check } from "lucide-react";
import type { OrderRecord } from "@/types";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  MTN_MOMO:         "MTN Mobile Money",
  TELECEL_CASH:     "Telecel Cash",
  AIRTELTIGO_MONEY: "AirtelTigo Money",
  WALLET:           "Wallet",
};

const STATUS_DETAIL: Record<string, { label: string; description: string }> = {
  PENDING:           { label: "Payment Pending",    description: "Waiting for payment confirmation from your MoMo provider." },
  PAYMENT_CONFIRMED: { label: "Payment Received",   description: "Payment confirmed. Your order has been queued for delivery." },
  PROCESSING:        { label: "Delivering",         description: "Order submitted to the network. Data bundle is being sent to your number." },
  DELIVERED:         { label: "Delivered",          description: "Data bundle has been successfully sent to the recipient number." },
  FAILED:            { label: "Delivery Failed",    description: "The delivery attempt failed. You will be refunded if payment was made." },
  REFUNDED:          { label: "Refunded",           description: "This order was refunded to your wallet." },
};

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-color-border/20 last:border-0">
      <span className="text-xs text-text-muted uppercase tracking-wider font-medium shrink-0 w-36">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`text-sm text-text-primary truncate ${mono ? "font-mono" : ""}`}>{value}</span>
        <button onClick={copy} className="text-text-muted hover:text-text-secondary transition-colors shrink-0">
          {copied ? <Check className="h-3 w-3 text-color-success" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

export function TrackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ref, setRef] = useState(searchParams.get("ref") ?? "");
  const [input, setInput] = useState(ref);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchOrder(r: string) {
    if (!r) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/order/${r}`);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Order not found.");
        setOrder(null);
      } else {
        setOrder(await res.json());
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ref) fetchOrder(ref);
  }, [ref]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (order && ["PENDING", "PAYMENT_CONFIRMED", "PROCESSING"].includes(order.status)) {
      pollRef.current = setInterval(() => fetchOrder(order.reference), 30_000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    setRef(trimmed);
    router.replace(`/track?ref=${trimmed}`);
  }

  const statusDetail = order ? STATUS_DETAIL[order.status] : null;

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Order reference or phone number (e.g. 0551234987)"
          className="flex-1 liquid-glass rounded-xl px-4 py-3 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all"
        />
        <GlowButton type="submit" loading={loading}>
          <Search className="h-4 w-4" />
          Track
        </GlowButton>
      </form>

      {error && (
        <div className="text-red-400 text-sm p-4 border border-red-400/20 rounded-xl bg-red-400/10 mb-6">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-4">
          {/* Status hero */}
          <GlassPanel className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-text-muted font-mono mb-1">{order.reference}</p>
                <h2 className="font-heading text-2xl text-text-primary">
                  {order.bundleSize} — {order.network}
                </h2>
                {statusDetail && (
                  <p className="text-text-secondary text-sm mt-1">{statusDetail.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={order.status} />
                {["PENDING", "PROCESSING", "PAYMENT_CONFIRMED"].includes(order.status) && (
                  <button
                    onClick={() => fetchOrder(order.reference)}
                    className="text-text-muted hover:text-text-primary transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <OrderTimeline
              status={order.status}
              timestamps={{ PLACED: order.createdAt, DELIVERED: order.deliveredAt }}
            />

            {order.status === "DELIVERED" && (
              <p className="mt-4 text-emerald-400 text-sm font-medium">
                ✓ Data delivered to {order.recipientPhone}
              </p>
            )}

            {order.status === "FAILED" && (
              <div className="mt-4">
                <p className="text-red-400 text-sm mb-3">{order.failureReason ?? "Delivery failed."}</p>
                <a href="https://wa.me/233000000000" target="_blank" rel="noopener noreferrer">
                  <GlowButton variant="ghost" size="sm">Contact Support</GlowButton>
                </a>
              </div>
            )}
          </GlassPanel>

          {/* Order details */}
          <GlassPanel className="p-6">
            <h3 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Order Details</h3>
            <InfoRow label="Order ID"       value={order.id}                                       mono />
            <InfoRow label="Reference"      value={order.reference}                                mono />
            <InfoRow label="Network"        value={order.network} />
            <InfoRow label="Bundle"         value={`${order.bundleSize} — ${order.bundleValidity}`} />
            <InfoRow label="Recipient"      value={order.recipientPhone}                           mono />
            <InfoRow label="Amount Paid"    value={`GH₵ ${Number(order.sellPrice).toFixed(2)}`}   mono />
            <InfoRow label="Payment Method" value={PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod} />
            {order.paymentRef && (
              <InfoRow label="Payment Ref" value={order.paymentRef} mono />
            )}
            <InfoRow label="Placed"  value={new Date(order.createdAt).toLocaleString("en-GH")} />
            {order.deliveredAt && (
              <InfoRow label="Delivered" value={new Date(order.deliveredAt).toLocaleString("en-GH")} />
            )}
            <InfoRow label="Last Updated" value={new Date(order.updatedAt).toLocaleString("en-GH")} />
          </GlassPanel>

          {["PENDING", "PAYMENT_CONFIRMED", "PROCESSING"].includes(order.status) && (
            <p className="text-center text-xs text-text-muted">
              Auto-refreshes every 30 seconds. You can also bookmark this page.
            </p>
          )}
        </div>
      )}
    </>
  );
}
