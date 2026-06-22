"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { DashboardSidebar } from "./DashboardSidebar";


const NAV_LINKS = [
  { href: "/",         label: "Home" },
  { href: "/buy",      label: "Buy Data" },
  { href: "/buy/bulk", label: "Bulk Buy" },
  { href: "/track",    label: "Track Order" },
  { href: "/status",   label: "Status" },
  { href: "/reseller", label: "Reseller" },
  { href: "/about",    label: "About" },
];

/** Dashboard-like pages that get the compact top bar + sidebar instead of the full horizontal nav */
const DASHBOARD_PATHS = ["/dashboard", "/admin", "/reseller"];

function isDashboardPage(pathname: string): boolean {
  return DASHBOARD_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}



export function Navbar() {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const compact = isDashboardPage(pathname);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.auth.getUser();
      const authed = !!data.user;
      setAuthed(authed);
      if (authed) {
        const me = await fetch("/api/auth/me").then(r => r.json()).catch(() => ({}));
        setIsAdmin(me?.user?.role === "ADMIN");
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authed = !!session?.user;
      setAuthed(authed);
      if (authed) {
        const me = await fetch("/api/auth/me").then(r => r.json()).catch(() => ({}));
        setIsAdmin(me?.user?.role === "ADMIN");
      } else {
        setIsAdmin(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close sidebars on route change
  useEffect(() => {
    setSidebarOpen(false);
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ─── Full horizontal navbar (non-dashboard pages) ──────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-500",
          compact && "hidden"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 mt-4 flex items-center justify-between relative">
          {/* Logo — left, natural width */}
          <Link
            href="/"
            className="group shrink-0"
            onClick={() => setOpen(false)}
            aria-label="TamalData home"
          >
            <Image src="/logo.png" alt="TamalData" width={350} height={100} className="h-20 md:h-28 w-auto object-contain" priority />
          </Link>

          {/* Desktop nav — perfectly centered on screen, independent of side elements */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full px-2 py-1.5 liquid-glass-strong ring-1 ring-color-border/50">
            {NAV_LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : (pathname === l.href || pathname.startsWith(l.href + "/"));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-sm font-semibold font-barlow transition-all duration-200",
                    active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right controls — pushed to right end */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <ThemeToggle />
            {authed ? (
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="group inline-flex items-center gap-1.5 rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 active:scale-[0.98]"
              >
                <LayoutDashboard className="h-4 w-4" />
                {isAdmin ? "Admin" : "Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="liquid-glass rounded-full px-4 py-2 text-sm font-medium font-barlow text-text-primary transition-colors hover:text-accent-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/buy"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 active:scale-[0.98]"
                >
                  Buy Data
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-text-primary transition-colors"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden px-4 mt-3"
            >
              <nav className="liquid-glass rounded-[1.25rem] p-3 flex flex-col gap-1">
                {NAV_LINKS.map((l) => {
                  const active = l.href === "/" ? pathname === "/" : pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cn(
                        "px-4 py-2.5 rounded-full text-sm font-medium font-barlow transition-colors",
                        active
                          ? "bg-accent-primary/10 text-text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-accent-primary/5"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  );
                })}
                <div className="flex gap-2 pt-3 mt-2 border-t border-color-border">
                  {authed ? (
                    <Link
                      href={isAdmin ? "/admin" : "/dashboard"}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {isAdmin ? "Admin" : "Dashboard"}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="liquid-glass flex-1 rounded-full px-4 py-2.5 text-center text-sm font-medium font-barlow text-text-primary"
                        onClick={() => setOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/buy"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-primary px-4 py-2.5 text-font-semibold text-white"
                        onClick={() => setOpen(false)}
                      >
                        Buy Data
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Dashboard compact top bar (logo + hamburger) ──────────────── */}
      <AnimatePresence>
        {compact && (
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-transparent"
          >
            <div className="mx-auto max-w-7xl px-4 mt-3 flex items-center justify-between">
              {/* Logo — left */}
              <Link
                href={pathname.startsWith("/admin") ? "/admin" : pathname.startsWith("/reseller") ? "/reseller" : "/dashboard"}
                className="shrink-0"
                aria-label="Dashboard home"
              >
                <Image src="/logo.png" alt="TamalData" width={350} height={100} className="h-20 md:h-28 w-auto object-contain" priority />
              </Link>

              {/* Hamburger button — right */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-text-primary hover:text-accent-primary transition-all duration-300 hover:border-accent-primary/30 active:scale-95"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ─── Dashboard Sidebar ──────────────────────────────────────── */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
