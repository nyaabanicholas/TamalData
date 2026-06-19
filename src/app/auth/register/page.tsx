"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { isValidGhanaPhone } from "@/lib/utils";

const inputCls = (err: boolean) =>
  `w-full rounded-xl bg-bg-elevated border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-barlow focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all ${err ? "border-color-error" : "border-color-border"}`;

const Schema = z
  .object({
    name:            z.string().min(2, "Enter your full name"),
    phone:           z.string().refine((v) => isValidGhanaPhone(v.replace(/\s/g, "")), "Invalid Ghana phone number"),
    email:           z.string().email().optional().or(z.literal("")),
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role:            z.enum(["USER", "RESELLER"]),
    terms:           z.boolean().refine((v) => v, "You must accept the terms"),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormData = z.infer<typeof Schema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-color-error">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "reseller" ? "RESELLER" : "USER";

  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { role: defaultRole, terms: false },
  });

  const role = watch("role");

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone.replace(/\s/g, ""),
          email: data.email || undefined,
          password: data.password,
          role: data.role,
        }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setError(json.error ?? "Registration failed."); return; }

      // Auto-login after successful registration
      const loginEmail = data.email || `${data.phone.replace(/\s/g, "")}@tamaldata.internal`;
      const supabase   = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: data.password,
      });

      if (signInError) {
        // Registration succeeded but auto-login failed — send them to login page
        router.push("/auth/login?registered=1");
        router.refresh();
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="font-heading text-3xl text-text-primary">Create Account</h1>
          <p className="text-text-muted text-sm mt-1.5 font-barlow">Join TamalData — Ghana&apos;s fastest data marketplace</p>
        </div>

        <div className="liquid-glass-strong rounded-2xl p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role toggle */}
            <div className="liquid-glass grid grid-cols-2 gap-2 p-1 rounded-full">
              {(["USER", "RESELLER"] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-full cursor-pointer text-xs font-semibold font-barlow transition-all ${
                    role === r ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <input {...register("role")} type="radio" value={r} className="sr-only" />
                  {r === "USER" ? "Regular Buyer" : "Reseller"}
                </label>
              ))}
            </div>

            <Field label="Full Name" error={errors.name?.message}>
              <input {...register("name")} placeholder="Kwame Mensah" className={inputCls(!!errors.name)} />
            </Field>

            <Field label="Phone Number" error={errors.phone?.message}>
              <input {...register("phone")} type="tel" placeholder="0244 123 456" className={inputCls(!!errors.phone)} />
            </Field>

            <Field label="Email (optional)" error={errors.email?.message}>
              <input {...register("email")} type="email" placeholder="you@email.com" className={inputCls(!!errors.email)} />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <input {...register("password")} type="password" placeholder="••••••••" autoComplete="new-password" className={inputCls(!!errors.password)} />
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <input {...register("confirmPassword")} type="password" placeholder="••••••••" autoComplete="new-password" className={inputCls(!!errors.confirmPassword)} />
            </Field>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input {...register("terms")} type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--accent-primary)]" />
              <span className="text-xs text-text-muted font-barlow">
                I agree to the{" "}
                <a href="/terms" className="text-accent-primary hover:underline">Terms</a>{" "}
                and{" "}
                <a href="/privacy" className="text-accent-primary hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-color-error">{errors.terms.message}</p>}

            {error && (
              <p className="text-xs text-color-error p-3 rounded-xl border border-color-error/30 bg-color-error/10 font-barlow">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--gradient-cta)" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-5 font-barlow">
            Have an account?{" "}
            <Link href="/auth/login" className="text-accent-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
