import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Soft accent tile for empty states and tips. Replaces emoji glyphs. */
export function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary ring-1 ring-inset ring-accent-primary/20",
        className
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </div>
  );
}
