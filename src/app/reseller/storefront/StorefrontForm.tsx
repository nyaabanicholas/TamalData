"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ResellerStorefront } from "@prisma/client";

const schema = z.object({
  slug:           z.string().min(3, "At least 3 chars").max(40).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  displayName:    z.string().min(2, "Required").max(80),
  whatsapp:       z.string().optional(),
  bio:            z.string().max(200).optional(),
  showMTN:        z.boolean(),
  showTelecel:    z.boolean(),
  showAirtelTigo: z.boolean(),
  active:         z.boolean(),
});
type FormData = z.infer<typeof schema>;

export function StorefrontForm({ storefront, userId }: { storefront: ResellerStorefront | null; userId: string }) {
  const router = useRouter();
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug:           storefront?.slug ?? userId.toLowerCase().slice(0, 20),
      displayName:    storefront?.displayName ?? "",
      whatsapp:       storefront?.whatsapp ?? "",
      bio:            storefront?.bio ?? "",
      showMTN:        storefront?.showMTN ?? true,
      showTelecel:    storefront?.showTelecel ?? true,
      showAirtelTigo: storefront?.showAirtelTigo ?? true,
      active:         storefront?.active ?? true,
    },
  });

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/reseller/storefront", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const b = await res.json();
        setError(b.error ?? "Save failed");
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {storefront && (
        <GlassPanel className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-0.5">Your shop link</p>
            <p className="font-mono text-accent-primary text-sm">/shop/{storefront.slug}</p>
          </div>
          <Link href={`/shop/${storefront.slug}`} target="_blank"
            className="px-3 py-1.5 rounded-btn text-xs font-semibold border border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10 transition-colors">
            Preview →
          </Link>
        </GlassPanel>
      )}

      <GlassPanel className="p-6 space-y-4">
        <h2 className="font-display font-semibold text-text-primary mb-2">Basic Info</h2>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Shop URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm">/shop/</span>
            <input {...register("slug")} className="flex-1 bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all" />
          </div>
          {errors.slug && <p className="text-color-error text-xs mt-1">{errors.slug.message}</p>}
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Display Name</label>
          <input {...register("displayName")} className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all" />
          {errors.displayName && <p className="text-color-error text-xs mt-1">{errors.displayName.message}</p>}
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">WhatsApp Number (optional)</label>
          <input {...register("whatsapp")} placeholder="0244000000" className="w-full bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 transition-all" />
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-widest block mb-2">Bio (optional, max 200 chars)</label>
          <textarea {...register("bio")} rows={3} className="w-full bg-bg-elevated border border-color-border rounded-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 transition-all resize-none" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h2 className="font-display font-semibold text-text-primary mb-4">Networks Shown</h2>
        <div className="space-y-3">
          {[
            { key: "showMTN",        label: "MTN",       color: "#FFCB00" },
            { key: "showTelecel",    label: "Telecel",   color: "#E30613" },
            { key: "showAirtelTigo", label: "AirtelTigo",color: "#9333EA" },
          ].map((net) => (
            <label key={net.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register(net.key as keyof FormData)} className="accent-accent-primary w-4 h-4" />
              <span className="font-semibold" style={{ color: net.color }}>{net.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-color-border/40">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register("active")} className="accent-accent-primary w-4 h-4" />
            <span className="text-text-primary font-semibold">Storefront Active (visible to public)</span>
          </label>
        </div>
      </GlassPanel>

      {error && <p className="text-color-error text-sm">{error}</p>}

      <GlowButton type="submit" disabled={saving} className="w-full">
        {saving ? "Saving..." : saved ? "Saved!" : "Save Storefront"}
      </GlowButton>
    </form>
  );
}
