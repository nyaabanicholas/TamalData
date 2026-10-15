import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-text-muted/10 text-text-muted ring-text-muted/25",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    className: "bg-color-warning/10 text-color-warning ring-color-warning/25",
  },
  PENDING_FULFILLMENT: {
    label: "Awaiting Fulfillment",
    className: "bg-accent-primary/10 text-accent-primary ring-accent-primary/25",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-color-warning/10 text-color-warning ring-color-warning/25",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-color-success/10 text-color-success ring-color-success/25",
  },
  FAILED: {
    label: "Failed",
    className: "bg-color-error/10 text-color-error ring-color-error/25",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-accent-purple/10 text-accent-purple ring-accent-purple/25",
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
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        statusClass,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
