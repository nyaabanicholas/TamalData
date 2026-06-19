"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlowButton } from "@/components/ui/GlowButton";
import { formatGHS } from "@/lib/utils";
import { useRouter } from "next/navigation";

const schema = z.object({
  amount:      z.number().min(1, "Enter an amount"),
  momoPhone:   z.string().regex(/^0[2345]\d{8}$/, "Enter a valid Ghana MoMo number"),
  momoNetwork: z.enum(["MTN", "TELECEL", "AIRTELTIGO"]),
});
type FormData = z.infer<typeof schema>;

const NETWORK_COLOR: Record<string, string> = { MTN: "#FFCB00", TELECEL: "#E30613", AIRTELTIGO: "#9333EA" };

export function PayoutForm({ balance, minPayout }: { balance: number; minPayout: number }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { momoNetwork: "MTN", amount: Math.min(balance, 100) },
  });

  const selectedNet = watch("momoNetwork");

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reseller/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Request failed");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">
          Amount (GH₵) — Balance: <span className="text-accent-primary font-semibold">{formatGHS(balance)}</span>
        </label>
        <input
          type="number"
          step="0.01"
          min={minPayout}
          max={balance}
          {...register("amount", { valueAsNumber: true })}
          className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all"
        />
        {errors.amount && <p className="text-color-error text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* MoMo Network */}
      <div>
        <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">MoMo Network</label>
        <div className="flex gap-2">
          {(["MTN", "TELECEL", "AIRTELTIGO"] as const).map((net) => (
            <button
              key={net}
              type="button"
              onClick={() => setValue("momoNetwork", net)}
              className="flex-1 py-2 rounded-btn text-xs font-semibold transition-all"
              style={selectedNet === net
                ? { backgroundColor: NETWORK_COLOR[net], color: net === "MTN" ? "#1A1200" : "#fff" }
                : { border: "1px solid var(--color-border)", color: "var(--text-secondary)" }}>
              {net === "AIRTELTIGO" ? "AirtelTigo" : net}
            </button>
          ))}
        </div>
      </div>

      {/* MoMo Phone */}
      <div>
        <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">MoMo Phone Number</label>
        <input
          type="tel"
          {...register("momoPhone")}
          placeholder="0244000000"
          className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 transition-all"
        />
        {errors.momoPhone && <p className="text-color-error text-xs mt-1">{errors.momoPhone.message}</p>}
      </div>

      {error && <p className="text-color-error text-sm">{error}</p>}

      <GlowButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Request Payout"}
      </GlowButton>
    </form>
  );
}
