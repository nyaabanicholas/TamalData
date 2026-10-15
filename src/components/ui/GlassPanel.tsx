import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function GlassPanel({ children, className, hover = false, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "liquid-glass rounded-[1.25rem] p-6",
        hover && "transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent-primary/30 hover:-translate-y-1 hover:shadow-glow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
