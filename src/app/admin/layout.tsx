import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";
import { AdminSignOutButton } from "@/components/ui/AdminSignOutButton";

export const metadata: Metadata = { title: { default: "Admin", template: "%s — Admin | TamalData" } };

const ADMIN_NAV = [
  { href: "/admin",             label: "Overview",     icon: "📊" },
  { href: "/admin/orders",      label: "Orders",       icon: "📦" },
  { href: "/admin/payouts",     label: "Payouts",      icon: "💸" },
  { href: "/admin/transactions",label: "Transactions", icon: "🪙" },
  { href: "/admin/resellers",   label: "Resellers",    icon: "🤝" },
  { href: "/admin/users",       label: "Users",        icon: "👥" },
  { href: "/admin/pricing",     label: "Pricing",      icon: "💰" },
  { href: "/admin/api-health",  label: "API Health",   icon: "🔌" },
  { href: "/admin/settings",    label: "Settings",     icon: "⚙️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-color-border/40 bg-bg-surface sticky top-0 h-screen overflow-y-auto pt-16">
        <div className="p-4 border-b border-color-border/40">
          <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">Admin Panel</p>
        </div>
        <nav className="p-3 flex flex-col gap-0.5 flex-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all duration-150"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Sign Out Button */}
        <div className="p-3 border-t border-color-border/40">
          <AdminSignOutButton className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-color-error hover:text-color-error hover:bg-color-error/10 transition-all duration-150 w-full" />
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-color-border/40 flex overflow-x-auto">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-text-muted hover:text-text-primary flex-1 min-w-max"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-16 pb-20 lg:pb-0">
        {children}
      </main>
      
      {/* Sign Out Button - also in header for better visibility */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <AdminSignOutButton className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-color-error hover:text-color-error hover:bg-color-error/10 transition-all duration-150 liquid-glass" />
      </div>
    </div>
  );
}
