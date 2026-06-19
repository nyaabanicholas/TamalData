"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, CreditCard, Wallet,
  Gift, BookOpen, FileText, LogOut, User,
  ChevronRight, Database, Wifi, Globe,
  X, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  children?: { href: string; label: string; icon?: LucideIcon }[];
}

const DASHBOARD_SIDEBAR_ITEMS: (SidebarItem | "divider")[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/buy",
    label: "Buy Data",
    icon: ShoppingBag,
    children: [
      { href: "/buy?network=MTN", label: "MTN", icon: Database },
      { href: "/buy?network=AIRTELTIGO", label: "AirtelTigo", icon: Wifi },
      { href: "/buy?network=TELECEL", label: "Telecel", icon: Globe },
    ],
  },
  "divider",
  { href: "/dashboard/transactions", label: "Transaction History", icon: CreditCard },
  { href: "/dashboard/orders", label: "My Orders", icon: FileText },
  { href: "/dashboard/referrals", label: "Refer & Earn", icon: Gift },
  { href: "/dashboard/saved-numbers", label: "Saved Numbers", icon: BookOpen },
  "divider",
  { href: "/about", label: "API Documentation", icon: BookOpen },
  { href: "/about", label: "Tutorials & Guides", icon: FileText },
];

const RESELLER_SIDEBAR_ITEMS: (SidebarItem | "divider")[] = [
  {
    href: "/reseller",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { href: "/reseller/orders", label: "Orders", icon: ShoppingBag },
  { href: "/reseller/customers", label: "Customers", icon: User },
  { href: "/reseller/analytics", label: "Analytics", icon: Star },
  "divider",
  { href: "/reseller/pricing", label: "Pricing", icon: CreditCard },
  { href: "/reseller/earnings", label: "Earnings", icon: Wallet },
  { href: "/reseller/storefront", label: "Storefront", icon: Globe },
  "divider",
  { href: "/about", label: "API Docs", icon: BookOpen },
];

const ADMIN_SIDEBAR_ITEMS: (SidebarItem | "divider")[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/admin/resellers", label: "Resellers", icon: User },
  "divider",
  { href: "/admin/users", label: "Users", icon: User },
  { href: "/admin/pricing", label: "Pricing", icon: CreditCard },
  { href: "/admin/api-health", label: "API Health", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: FileText },
];

function getSidebarItems(pathname: string): (SidebarItem | "divider")[] {
  if (pathname.startsWith("/admin")) return ADMIN_SIDEBAR_ITEMS;
  if (pathname.startsWith("/reseller")) return RESELLER_SIDEBAR_ITEMS;
  return DASHBOARD_SIDEBAR_ITEMS;
}

function getContextLabel(pathname: string): string {
  if (pathname.startsWith("/admin")) return "Admin Panel";
  if (pathname.startsWith("/reseller")) return "Reseller Portal";
  return "My Dashboard";
}

// ─── Sidebar overlay backdrop ─────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sidebarVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 28,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 350,
      mass: 0.7,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.05 + i * 0.025,
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// ─── Props ────────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

// ─── Component ────────────────────────────────────────────────────────

export function DashboardSidebar({ open, onClose, pathname }: DashboardSidebarProps) {
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const items = getSidebarItems(pathname);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthed(true);
        const me = await fetch("/api/auth/me").then(r => r.json()).catch(() => ({}));
        setUserName(me?.user?.name || me?.user?.phone || data.user.email || "User");
      }
    })();
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/reseller" || href === "/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sidebar-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            key="dashboard-sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 z-[95] h-full w-[300px] max-w-[85vw] liquid-glass-strong border-l border-glass-border flex flex-col overflow-hidden"
            style={{
              backdropFilter: "blur(48px) saturate(200%)",
              boxShadow: "-8px 0 48px rgba(0,0,0,0.15), 0 0 0 0.5px var(--glass-border)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted font-barlow">
                {getContextLabel(pathname)}
              </span>
              <button
                onClick={onClose}
                className="liquid-glass rounded-full p-2 text-text-muted hover:text-text-primary hover:border-accent-primary/30 transition-all"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User profile */}
            <div className="mx-4 mb-4 p-4 rounded-2xl liquid-glass">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-lg shrink-0">
                  {userName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {userName || "User"}
                  </p>
                  <Link
                    href={pathname.startsWith("/admin") ? "/admin/settings" : "/dashboard"}
                    onClick={onClose}
                    className="text-xs text-accent-primary hover:underline font-barlow inline-flex items-center gap-0.5"
                  >
                    View Profile
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Scrollable nav items */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-none">
              <nav className="flex flex-col gap-0.5">
                {items.map((item, i) => {
                  if (item === "divider") {
                    return (
                      <motion.div
                        key={`divider-${i}`}
                        custom={i}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="mx-3 my-2 h-px bg-color-border/20"
                      />
                    );
                  }

                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.href}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium font-barlow transition-all duration-200",
                          active
                            ? "bg-accent-primary/12 text-accent-primary"
                            : "text-text-secondary hover:text-text-primary hover:bg-accent-primary/6"
                        )}
                      >
                        <span className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                          active
                            ? "bg-accent-primary/15 text-accent-primary"
                            : "text-text-muted group-hover:text-text-primary"
                        )}>
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary uppercase tracking-wider">
                            {item.badge}
                          </span>
                        )}
                        {item.children && (
                          <ChevronRight className="h-3.5 w-3.5 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
                        )}
                      </Link>

                      {/* Sub-items */}
                      {item.children && active && (
                        <div className="ml-8 mt-0.5 mb-0.5 flex flex-col gap-0.5 pl-3 border-l border-color-border/20">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href || pathname.includes(child.label.toUpperCase());
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium font-barlow transition-all duration-200",
                                  childActive
                                    ? "text-accent-primary bg-accent-primary/8"
                                    : "text-text-muted hover:text-text-primary hover:bg-accent-primary/5"
                                )}
                              >
                                {ChildIcon && <ChildIcon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-color-border/20 px-4 py-4 flex items-center justify-between">
              <ThemeToggle />
              {authed ? (
                <Link
                  href="/api/auth/logout"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium font-barlow text-color-error hover:bg-color-error/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Sign Out
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium font-barlow text-accent-primary hover:bg-accent-primary/10 transition-all duration-200"
                >
                  <User className="h-4 w-4" strokeWidth={1.5} />
                  Sign In
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
