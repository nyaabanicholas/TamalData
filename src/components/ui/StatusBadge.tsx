import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-text-muted/20 text-text-muted",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    className: "bg-color-warning/20 text-color-warning",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-color-warning/20 text-color-warning",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-color-success/20 text-color-success",
  },
  FAILED: {
    label: "Failed",
    className: "bg-color-error/20 text-color-error",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-accent-purple/20 text-accent-purple",
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClass } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusClass,
        className
      )}
    >
      {label}
    </span>
  );
}
