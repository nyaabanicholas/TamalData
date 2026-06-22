"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UpgradeToResellerPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/upgrade-to-reseller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "upgrade" }),
      });
      const data = await res.json() as { success?: boolean; upgraded?: boolean; error?: string; redirected?: string };

      if (!res.ok) {
        if (data.redirected) {
          router.push(data.redirected);
          return;
        }
        setError(data.error ?? "Failed to upgrade account");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-4 pt-28 pb-12">
      <div className="w-full max-w-md text-center">
        <div className="liquid-glass-strong rounded-2xl p-8">
          {done ? (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="font-heading text-2xl text-text-primary mb-2">Application Submitted!</h1>
              <p className="text-text-secondary font-barlow text-sm mb-6">
                Your reseller application is pending admin approval. You&apos;ll receive an SMS once approved — usually within 24–48 hours.
              </p>
              <Link
                href="/reseller"
                className="inline-block w-full rounded-xl py-3 text-sm font-semibold text-white mb-3"
                style={{ background: "var(--gradient-cta)" }}
              >
                Go to Reseller Portal
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-text-muted hover:text-text-primary font-barlow transition-colors block mt-2"
              >
                ← Back to Dashboard
              </Link>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="font-heading text-2xl text-text-primary mb-2">Upgrade to Reseller</h1>
              <p className="text-text-secondary font-barlow text-sm mb-6">
                Upgrade your existing account to access reseller features. Your application will be reviewed and approved by an admin.
              </p>

              {error && (
                <p className="text-xs font-barlow text-center mb-4 rounded-xl p-3"
                  style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white mb-4 disabled:opacity-60"
                style={{ background: "var(--gradient-cta)" }}
              >
                {loading ? "Submitting..." : "Apply for Reseller Account"}
              </button>

              <div className="flex items-center gap-2 my-4">
                <span className="flex-1 border-b border-color-border/40" />
                <span className="text-xs text-text-muted font-barlow">or</span>
                <span className="flex-1 border-b border-color-border/40" />
              </div>

              <Link
                href="/auth/register?role=reseller"
                className="text-sm text-text-muted hover:text-text-primary font-barlow transition-colors"
              >
                Create a new reseller account instead
              </Link>

              <Link
                href="/dashboard"
                className="text-sm text-text-muted hover:text-text-primary font-barlow transition-colors mt-4 block"
              >
                ← Back to Dashboard
              </Link>
            </>
          )}
        </div>

        <GlassPanel className="mt-6 p-5 text-left">
          <h3 className="font-semibold text-text-primary text-sm mb-2">Reseller Benefits</h3>
          <ul className="text-xs text-text-secondary font-barlow space-y-1.5">
            <li>• Buy at wholesale prices (8% markup vs 15% for retail)</li>
            <li>• Create your own branded storefront</li>
            <li>• Set custom prices for all bundles</li>
            <li>• Your store link: tamaldata.com/store/your-name</li>
            <li>• Track all sales and earnings</li>
            <li>• Request payouts to your MoMo</li>
            <li>• Free to upgrade — no upfront costs</li>
          </ul>
        </GlassPanel>
      </div>
    </main>
  );
}
