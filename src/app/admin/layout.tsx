import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { AdminSignOutButton } from "@/components/ui/AdminSignOutButton";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s — Admin | TamalData" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar: floating glass rail */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col p-3 pt-24">
        <div className="liquid-glass flex flex-1 flex-col overflow-y-auto rounded-[1.25rem]">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">Admin</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-2.5">
            <AdminNav variant="rail" />
          </nav>
          <div className="m-2.5 border-t border-color-border/40 pt-2.5">
            <AdminSignOutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-color-error transition-colors duration-200 hover:bg-color-error/10" />
          </div>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex overflow-x-auto border-t border-color-border/40 bg-bg-surface/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <AdminNav variant="bar" />
      </nav>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-16 pb-24 lg:pb-0">
        {children}
      </main>

      {/* Mobile sign-out */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <AdminSignOutButton className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-color-error hover:bg-color-error/10 transition-colors duration-200 liquid-glass" />
      </div>
    </div>
  );
}
