import { cn } from "@/lib/utils";

interface LiveDotProps {
  active?: boolean;
  className?: string;
}

export function LiveDot({ active = true, className }: LiveDotProps) {
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      {active && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-color-success opacity-75 animate-ping" />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          active ? "bg-color-success" : "bg-text-muted"
        )}
      />
    </span>
  );
}
