import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-barlow transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "liquid-glass border-color-border/40 text-text-secondary",
        primary:
          "border-accent-primary/30 bg-accent-primary/10 text-accent-primary",
        success:
          "border-color-success/30 bg-color-success/10 text-color-success",
        warning:
          "border-color-warning/30 bg-color-warning/10 text-color-warning",
        destructive:
          "border-color-error/30 bg-color-error/10 text-color-error",
        outline:
          "border-color-border text-text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
