import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-color-border bg-bg-elevated/60 px-4 py-2.5 text-sm font-barlow text-text-primary",
          "placeholder:text-text-muted",
          "backdrop-blur-sm transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
