import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/reseller/OnboardingWizard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { 
  title: "Reseller Onboarding | TamalData",
  description: "Set up your reseller storefront and start selling data bundles"
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/reseller/onboarding");

  // Check if user is already a reseller with storefront
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      resellerStatus: true,
      storefront: true,
    },
  });

  // If not a reseller, redirect to upgrade
  if (user?.role !== "RESELLER") {
    redirect("/dashboard");
  }

  // If already has storefront and is approved, redirect to reseller dashboard
  if (user?.storefront && user.resellerStatus === "APPROVED") {
    redirect("/reseller");
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <OnboardingWizard userId={session.user.id} />
    </div>
  );
}
