import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PricingEditor } from "./PricingEditor";
import { ALL_STATIC_BUNDLES } from "@/lib/staticBundles";
import { applyMarkup } from "@/lib/markup";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Pricing" };

export default async function AdminPricingPage() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/sign-in");

  let configs = await prisma.pricingConfig.findMany({ orderBy: { updatedAt: "desc" } });

  // Seed global defaults if empty
  if (configs.length === 0) {
    await prisma.pricingConfig.createMany({
      data: [
        { network: null, bundleId: null, markupPercent: 15, isGlobal: true, isResellerTier: false, label: "Default retail markup" },
        { network: null, bundleId: null, markupPercent: 8,  isGlobal: true, isResellerTier: true,  label: "Default reseller markup" },
      ],
    });
    configs = await prisma.pricingConfig.findMany({ orderBy: { updatedAt: "desc" } });
  }

  const globalRetailMarkup = Number(
    configs.find((c) => c.isGlobal && !c.isResellerTier)?.markupPercent ?? 15
  );

  // Build per-bundle sell price map from existing configs
  const bundleOverrides = new Map(
    configs
      .filter((c) => c.bundleId && !c.isResellerTier)
      .map((c) => [c.bundleId!, Number(c.markupPercent)])
  );

  // Annotate each static bundle with its current sell price
  const bundles = ALL_STATIC_BUNDLES.map((b) => {
    const markup = bundleOverrides.has(b.id)
      ? bundleOverrides.get(b.id)!
      : globalRetailMarkup;
    return {
      ...b,
      sellPrice: applyMarkup(b.price, markup / 100),
    };
  });

  return (
    <div className="container-content py-10 max-w-4xl">
      <h1 className="font-heading text-3xl md:text-4xl tracking-tight text-text-primary mb-2">Pricing</h1>
      <p className="text-text-secondary mb-8">
        Set sell prices for each bundle. Changes apply to all future orders.
      </p>
      <PricingEditor
        globalConfigs={configs
          .filter((c) => c.isGlobal)
          .map((c) => ({ ...c, markupPercent: Number(c.markupPercent) }))}
        bundles={bundles}
        globalRetailMarkup={globalRetailMarkup}
      />
    </div>
  );
}
