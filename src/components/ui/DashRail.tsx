"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { getSidebarItems, getContextLabel } from "./DashboardSidebar";
import { cn } from "@/lib/utils";

const ROOTS = ["/dashboard", "/reseller"];

/** Persistent desktop navigation for /dashboard and /reseller. Mobile keeps the navbar drawer. */
export function DashRail() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const items = getSidebarItems(pathname);
  const isActive = (href: string) =>
    ROOTS.includes(href) ? pathname === href : pathname.startsWith(href.split("?")[0]);

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col p-3 pt-24">
      <div className="liquid-glass flex flex-1 flex-col overflow-y-auto rounded-[1.25rem]">
        <p className="px-5 pt-5 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          {getContextLabel(pathname)}
        </p>
        <nav className="flex flex-1 flex-col gap-0.5 px-2.5">
          {items.map((item, i) =>
            item === "divider" ? (
              <div key={`d${i}`} className="mx-3 my-2 h-px bg-color-border/40" />
            ) : (
              <Link
                key={item.href + item.label}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color] duration-200",
                  isActive(item.href)
                    ? "bg-accent-primary/10 text-text-primary"
                    : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
                )}
              >
                {isActive(item.href) && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-primary" />
                )}
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    isActive(item.href) ? "text-accent-primary" : "text-text-muted group-hover:text-text-primary"
                  )}
                  strokeWidth={1.5}
                />
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="space-y-1 p-2.5">
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-color-error/10 hover:text-color-error"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Sign out
          </button>
          <Link
            href="/buy"
            className="group flex items-center justify-between rounded-full bg-accent-primary py-1.5 pl-4 pr-1.5 text-sm font-semibold text-white transition-transform duration-200 active:scale-[0.98]"
          >
            Buy data
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
