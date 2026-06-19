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
      "relative inline-flex items-center justify-center font-semibold rounded-btn transition-all duration-200 select-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-to-r from-[#009DF9] to-[#FE8E01] text-white shadow-lg shadow-[#009DF9]/20 active:scale-[0.98]",
      ghost:
        "border border-white/20 text-white/80 bg-transparent hover:border-white/50 hover:text-white active:scale-[0.98]",
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
