import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "liquid-glass rounded-card p-4",
        className
      )}
    >
      <div className="skeleton h-4 w-16 rounded mb-3" />
      <div className="skeleton h-7 w-24 rounded mb-2" />
      <div className="skeleton h-3 w-20 rounded mb-4" />
      <div className="skeleton h-9 w-full rounded-btn" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
