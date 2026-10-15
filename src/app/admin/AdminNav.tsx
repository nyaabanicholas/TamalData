"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, RefreshCw, Banknote, ArrowLeftRight,
  Handshake, Users, Tags, Activity, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin",              label: "Overview",     icon: LayoutDashboard },
  { href: "/admin/orders",       label: "Orders",       icon: Package },
  { href: "/admin/fulfillment",  label: "Fulfillment",  icon: RefreshCw },
  { href: "/admin/payouts",      label: "Payouts",      icon: Banknote },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/resellers",    label: "Resellers",    icon: Handshake },
  { href: "/admin/users",        label: "Users",        icon: Users },
  { href: "/admin/pricing",      label: "Pricing",      icon: Tags },
  { href: "/admin/api-health",   label: "API Health",   icon: Activity },
  { href: "/admin/settings",     label: "Settings",     icon: Settings },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname.startsWith(href);

export function AdminNav({ variant }: { variant: "rail" | "bar" }) {
  const pathname = usePathname();

  if (variant === "bar") {
    return (
      <>
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-[64px] flex-1 flex-col items-center gap-1 px-2 py-2.5 transition-colors duration-200",
                active ? "text-accent-primary" : "text-text-muted hover:text-text-primary"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color] duration-200",
              active
                ? "bg-accent-primary/10 text-text-primary"
                : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
            )}
          >
            {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-primary" />}
            <Icon
              className={cn("h-[18px] w-[18px] transition-colors", active ? "text-accent-primary" : "text-text-muted group-hover:text-text-primary")}
              strokeWidth={1.5}
            />
            {label}
          </Link>
        );
      })}
    </>
  );
}
