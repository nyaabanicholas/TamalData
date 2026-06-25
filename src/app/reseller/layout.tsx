import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default async function ResellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/reseller");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, resellerStatus: true, name: true, storefront: true },
  });

  const isApproved = user?.role === "RESELLER" && user.resellerStatus === "APPROVED";
  const isPending  = user?.role === "RESELLER" && user.resellerStatus === "PENDING_APPROVAL";
  const hasStorefront = user?.storefront !== null;

  const canAccess = user?.role === "ADMIN" || isApproved || isPending;

  // Get current path to avoid redirect loops
  const headerList = headers();
  const currentPath = headerList.get("x-invoke-path") ?? headerList.get("next-url") ?? "";
  const canDetectPath = currentPath.length > 0;
  const isOnboardingPage = canDetectPath && currentPath.includes("/reseller/onboarding");

  // If approved but no storefront, redirect to onboarding (but not if already there)
  if (canDetectPath && isApproved && !hasStorefront && !isOnboardingPage) {
    redirect("/reseller/onboarding");
  }

  if (!canAccess) {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-4 pt-28 pb-12">
        <div className="w-full max-w-md text-center">
          <div className="liquid-glass-strong rounded-2xl p-8">
            <div className="text-6xl mb-4">📋</div>
            <h1 className="font-heading text-2xl text-text-primary mb-2">Become a Reseller</h1>
            <p className="text-text-secondary font-barlow text-sm mb-6">
              Access wholesale pricing, your own storefront, and customer management.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/upgrade-to-reseller"
                className="w-full rounded-xl py-3 text-sm font-semibold text-white"
                style={{ background: "var(--gradient-cta)" }}
              >
                Upgrade My Account to Reseller
              </Link>
              <div className="flex items-center gap-2 my-2">
                <span className="flex-1 border-b border-color-border/40" />
                <span className="text-xs text-text-muted font-barlow">or</span>
                <span className="flex-1 border-b border-color-border/40" />
              </div>
              <Link
                href="/auth/register?role=reseller"
                className="w-full rounded-xl py-3 text-sm font-semibold text-white"
                style={{ background: "var(--gradient-cta)" }}
              >
                Create New Reseller Account
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-text-muted hover:text-text-primary font-barlow transition-colors mt-4"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
          <GlassPanel className="mt-6 p-5 text-left">
            <h3 className="font-semibold text-text-primary text-sm mb-2">Why become a reseller?</h3>
            <ul className="text-xs text-text-secondary font-barlow space-y-1.5">
              <li>• Buy at 8% markup (retail customers pay 15%)</li>
              <li>• Your own public storefront with custom link</li>
              <li>• Set your own bundle prices</li>
              <li>• Track earnings and request payouts</li>
              <li>• Customer management and analytics</li>
              <li>• Free to apply — no upfront fees</li>
            </ul>
          </GlassPanel>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <main className="pt-20">{children}</main>
    </div>
  );
}
