"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

const Schema = z.object({
  login: z.string().min(1, "Enter your phone or email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof Schema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";
  const registered = searchParams.get("registered") === "1";

  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [showSuccess, setShowSuccess] = useState(registered);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(Schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    setShowSuccess(false);

    // Sign in via the server route. It sets the Supabase auth cookies on the
    // HTTP response itself. After the response is received, we verify the
    // session by calling /api/auth/me, then navigate once confirmed.
    const res = await fetch("/api/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: data.login, password: data.password }),
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error || "Invalid phone/email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Verify the session cookies are committed before navigating.
    // Retries up to 5 times with 200ms delay to handle timing edge cases.
    for (let i = 0; i < 5; i++) {
      try {
        const me = await fetch("/api/auth/me").then(r => r.json());
        if (me?.user?.id) break; // session confirmed
      } catch { /* transient — retry */ }
      await new Promise(r => setTimeout(r, 200));
    }

    // Navigate — the middleware has the getSession() fallback so even if
    // the verification above failed, the session will be detected on arrival.
    window.location.assign(from);
  }

  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-4 pt-28 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="liquid-glass p-5 rounded-3xl">
              <Image src="/logo.png" alt="TamalData" width={96} height={96} className="rounded-2xl" />
            </div>
          </div>
          <h1 className="font-heading text-3xl text-text-primary">Welcome back</h1>
          <p className="text-text-muted text-sm mt-1.5 font-barlow">Sign in to your TamalData account</p>
        </div>

        <div className="liquid-glass-strong rounded-2xl p-7">
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2.5 rounded-xl bg-color-success/10 border border-color-success/20 px-4 py-3 mb-4"
            >
              <CheckCircle className="h-5 w-5 text-color-success shrink-0" />
              <p className="text-xs text-color-success font-barlow leading-snug">
                Account created successfully! Sign in below.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Phone or Email
              </label>
              <input
                {...register("login")}
                type="text"
                placeholder="0244123456 or you@email.com"
                autoComplete="username"
                className={`w-full rounded-xl bg-bg-elevated border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-barlow focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all ${
                  errors.login ? "border-color-error" : "border-color-border"
                }`}
              />
              {errors.login && <p className="mt-1 text-xs text-color-error">{errors.login.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-accent-primary hover:underline font-barlow">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full rounded-xl bg-bg-elevated border px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-muted font-barlow focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all ${
                    errors.password ? "border-color-error" : "border-color-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-color-error">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-xs text-color-error p-3 rounded-xl border border-color-error/30 bg-color-error/10 font-barlow">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--gradient-cta)" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-5 font-barlow">
            No account?{" "}
            <Link href="/auth/register" className="text-accent-primary hover:underline font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
