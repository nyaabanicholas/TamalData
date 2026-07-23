"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  reference: string;
  phone: string;
  bundleSize: string;
  network: string;
}

export function FulfillActions({ orderId, reference, phone, bundleSize, network }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkDelivered() {
    const confirmed = confirm(
      `Have you purchased and delivered ${bundleSize} ${network} for ${phone} (${reference}) via DataMart?\n\nClick OK only after DataMart confirms the delivery.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELIVERED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Failed to mark as delivered: ${data.error ?? "Unknown error"}`);
      } else {
        router.refresh();
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkFailed() {
    const reason = prompt(
      `Why did this order fail?\n\nEnter a reason (e.g. "Invalid phone number", "DataMart error", etc.):`
    );
    if (!reason) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FAILED", failureReason: reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Failed to mark as failed: ${data.error ?? "Unknown error"}`);
      } else {
        router.refresh();
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={handleMarkDelivered}
        disabled={loading}
        className="px-2 py-1 rounded text-xs font-semibold disabled:opacity-50 transition-opacity"
        style={{
          backgroundColor: "#10b98122",
          color: "#10b981",
          border: "1px solid #10b98144",
        }}
      >
        Mark Delivered
      </button>
      <button
        onClick={handleMarkFailed}
        disabled={loading}
        className="px-2 py-1 rounded text-xs font-semibold disabled:opacity-50 transition-opacity"
        style={{
          backgroundColor: "#ef444422",
          color: "#ef4444",
          border: "1px solid #ef444444",
        }}
      >
        Failed
      </button>
    </div>
  );
}
