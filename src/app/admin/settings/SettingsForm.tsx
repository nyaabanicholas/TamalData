"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useRouter } from "next/navigation";

const schema = z.object({
  maintenanceMode:    z.boolean(),
  maintenanceBanner:  z.string().max(200).optional(),
  referralCommission: z.number().min(0).max(1),
  minPayoutAmount:    z.number().min(1),
  mtnStatus:          z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
  telecelStatus:      z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
  airteltigoStatus:   z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
});
type FormData = z.infer<typeof schema>;

interface Settings {
  maintenanceMode: boolean;
  maintenanceBanner: string | null;
  referralCommission: number;
  minPayoutAmount: number;
  mtnStatus: string;
  telecelStatus: string;
  airteltigoStatus: string;
}

const STATUS_OPTIONS = ["OPERATIONAL", "DEGRADED", "DOWN"] as const;
const STATUS_COLOR: Record<string, string> = { OPERATIONAL: "#10b981", DEGRADED: "#f59e0b", DOWN: "#ef4444" };

export function SettingsForm({ settings }: { settings: Settings }) {
  const router   = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      maintenanceMode:    settings.maintenanceMode,
      maintenanceBanner:  settings.maintenanceBanner ?? "",
      referralCommission: settings.referralCommission,
      minPayoutAmount:    settings.minPayoutAmount,
      mtnStatus:          settings.mtnStatus as never,
      telecelStatus:      settings.telecelStatus as never,
      airteltigoStatus:   settings.airteltigoStatus as never,
    },
  });

  const maintenanceMode = watch("maintenanceMode");

  async function onSubmit(data: FormData) {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const b = await res.json(); setError(b.error ?? "Save failed"); }
      else { setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 3000); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <GlassPanel className="p-6 space-y-4">
        <h2 className="font-display font-semibold text-text-primary">Maintenance</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register("maintenanceMode")} className="accent-accent-primary w-4 h-4" />
          <div>
            <span className="text-text-primary font-semibold">Maintenance Mode</span>
            <p className="text-text-muted text-xs">Blocks all new orders. Existing users can still log in.</p>
          </div>
        </label>
        {maintenanceMode && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Banner Message</label>
            <input {...register("maintenanceBanner")} placeholder="We'll be back shortly…"
              className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 transition-all" />
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="p-6 space-y-4">
        <h2 className="font-display font-semibold text-text-primary">Financials</h2>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Referral Commission (decimal, e.g. 0.02 = 2%)</label>
          <input type="number" step="0.001" min={0} max={1} {...register("referralCommission", { valueAsNumber: true })}
            className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all" />
          {errors.referralCommission && <p className="text-color-error text-xs mt-1">{errors.referralCommission.message}</p>}
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Minimum Payout Amount (GH₵)</label>
          <input type="number" step="1" min={1} {...register("minPayoutAmount", { valueAsNumber: true })}
            className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 space-y-4">
        <h2 className="font-display font-semibold text-text-primary">Network Status</h2>
        {([["mtnStatus", "MTN"], ["telecelStatus", "Telecel"], ["airteltigoStatus", "AirtelTigo"]] as const).map(([field, label]) => (
          <div key={field}>
            <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">{label}</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" value={opt} {...register(field)} className="accent-accent-primary" />
                  <span className="text-xs font-semibold" style={{ color: STATUS_COLOR[opt] }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </GlassPanel>

      {error && <p className="text-color-error text-sm">{error}</p>}
      <GlowButton type="submit" disabled={saving} className="w-full">
        {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
      </GlowButton>
    </form>
  );
}
