import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function GlassPanel({ children, className, hover = false, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "liquid-glass rounded-card p-6",
        hover && "transition-all duration-300 hover:border-accent-primary/30 hover:-translate-y-1 hover:shadow-glow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
