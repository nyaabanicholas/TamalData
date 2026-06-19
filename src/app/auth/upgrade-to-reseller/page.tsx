import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade to Reseller",
  description: "Upgrade your TamalData account to become a reseller",
};

export default async function UpgradeToResellerPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login?from=/auth/upgrade-to-reseller");
  }

  // Check if user is already a reseller
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, resellerStatus: true },
  });

  if (user?.role === "RESELLER") {
    // If already approved, redirect to reseller dashboard
    // If pending, redirect to onboarding
    if (user.resellerStatus === "APPROVED") {
      redirect("/reseller");
    } else {
      redirect("/reseller/onboarding");
    }
  }

  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-4 pt-28 pb-12">
      <div className="w-full max-w-md text-center">
        <div className="liquid-glass-strong rounded-2xl p-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="font-heading text-2xl text-text-primary mb-2">Upgrade to Reseller</h1>
          <p className="text-text-secondary font-barlow text-sm mb-6">
            Upgrade your existing account to access reseller features. You&apos;ll be able to create your own storefront, set custom prices, and earn commissions.
          </p>
          
          <form action="/api/auth/upgrade-to-reseller" method="POST" className="flex flex-col gap-3">
            <input type="hidden" name="mode" value="upgrade" />
            <GlowButton type="submit" className="w-full">
              Upgrade My Account
            </GlowButton>
          </form>
          
          <div className="flex items-center gap-2 my-4">
            <span className="flex-1 border-b border-color-border/40" />
            <span className="text-xs text-text-muted font-barlow">or</span>
            <span className="flex-1 border-b border-color-border/40" />
          </div>
          
          <Link
            href="/auth/register?role=reseller"
            className="text-sm text-text-muted hover:text-text-primary font-barlow transition-colors"
          >
            Create a new reseller account instead
          </Link>
          
          <Link
            href="/dashboard"
            className="text-sm text-text-muted hover:text-text-primary font-barlow transition-colors mt-4 block"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <GlassPanel className="mt-6 p-5 text-left">
          <h3 className="font-semibold text-text-primary text-sm mb-2">Reseller Benefits</h3>
          <ul className="text-xs text-text-secondary font-barlow space-y-1.5">
            <li>• Buy at wholesale prices (8% markup vs 15% for retail)</li>
            <li>• Create your own branded storefront</li>
            <li>• Set custom prices for all bundles</li>
            <li>• Your store link: tamaldata.com/store/your-name</li>
            <li>• Track all sales and earnings</li>
            <li>• Request payouts to your MoMo</li>
            <li>• Free to upgrade — no upfront costs</li>
          </ul>
        </GlassPanel>
      </div>
    </main>
  );
}
