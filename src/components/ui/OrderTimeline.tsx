import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STEPS: { key: OrderStatus | "PLACED"; label: string }[] = [
  { key: "PLACED", label: "Order Placed" },
  { key: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
  { key: "PROCESSING", label: "Dispatching Data" },
  { key: "DELIVERED", label: "Delivered" },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  PLACED: 0,
  PAYMENT_CONFIRMED: 1,
  PROCESSING: 2,
  DELIVERED: 3,
  FAILED: -1,
  REFUNDED: -1,
};

interface OrderTimelineProps {
  status: OrderStatus;
  timestamps?: Partial<Record<string, string>>;
}

export function OrderTimeline({ status, timestamps }: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER[status] ?? 0;
  const isFailed = status === "FAILED" || status === "REFUNDED";

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, idx) => {
        const isDone = currentIndex > idx;
        const isCurrent = currentIndex === idx && !isFailed;
        const isPending = currentIndex < idx;

        return (
          <div key={step.key} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  isDone &&
                    "border-color-success bg-color-success/20 text-color-success",
                  isCurrent &&
                    "border-color-warning bg-color-warning/20 text-color-warning",
                  isPending &&
                    "border-color-border bg-bg-elevated text-text-muted",
                  isFailed && idx === currentIndex + 1 &&
                    "border-color-error bg-color-error/20 text-color-error"
                )}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[2rem] my-1",
                    isDone ? "bg-color-success/40" : "bg-color-border"
                  )}
                />
              )}
            </div>

            <div className="pb-6">
              <p
                className={cn(
                  "text-sm font-medium",
                  isDone && "text-color-success",
                  isCurrent && "text-color-warning",
                  isPending && "text-text-muted"
                )}
              >
                {step.label}
              </p>
              {timestamps?.[step.key] && (
                <p className="text-xs text-text-muted mt-0.5 font-mono">
                  {new Date(timestamps[step.key]!).toLocaleTimeString("en-GH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
