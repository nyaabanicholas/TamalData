import Link from "next/link";
import { BookMarked, Search, Store, Gift, ChevronRight } from "lucide-react";

const ACTIONS = [
  { href: "/dashboard/saved-numbers", icon: BookMarked, label: "Saved numbers", hint: "Faster checkout" },
  { href: "/track",                   icon: Search,     label: "Track an order", hint: "By reference or phone" },
  { href: "/dashboard/referrals",     icon: Gift,       label: "Refer and earn", hint: "Commission on every order" },
  { href: "/reseller",                icon: Store,      label: "Reseller portal", hint: "Wholesale pricing" },
];

export function QuickActions() {
  return (
    <div className="liquid-glass rounded-[1.25rem] p-3">
      <h2 className="px-3 pb-2 pt-2 text-sm font-medium text-text-muted">Shortcuts</h2>
      <ul>
        {ACTIONS.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-bg-elevated/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary ring-1 ring-inset ring-accent-primary/15">
                <a.icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-text-primary">{a.label}</span>
                <span className="block truncate text-xs text-text-muted">{a.hint}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
