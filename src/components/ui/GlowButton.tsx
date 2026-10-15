"use client";

import { motion } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "relative inline-flex items-center justify-center font-semibold rounded-full transition-[transform,box-shadow,background-color,border-color,color] duration-200 select-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-cta-gradient text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_28px_-10px_rgba(0,157,249,0.65)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_14px_34px_-10px_rgba(0,157,249,0.8)] active:scale-[0.98]",
      ghost:
        "border border-color-border text-text-secondary bg-transparent hover:border-accent-primary/40 hover:text-text-primary active:scale-[0.98]",
      secondary:
        "bg-bg-elevated/50 text-text-primary border border-color-border/50 hover:border-accent-primary/30 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-2.5",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        whileHover={{ scale: variant === "primary" ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing…
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

GlowButton.displayName = "GlowButton";
