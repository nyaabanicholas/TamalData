import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { STATIC_BUNDLES } from "@/lib/staticBundles";
import { ShopClient } from "./ShopClient";
import type { Metadata } from "next";
import type { DataBundle, Network } from "@/types";

// Apply reseller custom pricing to bundles
type BundlesWithCustomPricing = Record<Network, DataBundle[]>;

async function getBundlesWithResellerPricing(agentId: string): Promise<BundlesWithCustomPricing> {
  // Get reseller's custom pricing
  const pricing = await prisma.resellerPricing.findMany({
    where: { userId: agentId, isActive: true },
  });

  // Build a map of bundleId -> customPrice for each network
  const pricingMap: Record<string, Record<string, number>> = {
    MTN: {},
    TELECEL: {},
    AIRTELTIGO: {},
  };

  pricing.forEach((p) => {
    pricingMap[p.network as Network][p.bundleId] = parseFloat(p.customPrice.toString());
  });

  // Apply custom pricing to static bundles
  const result: BundlesWithCustomPricing = {
    MTN: STATIC_BUNDLES.MTN.map(b => ({
      ...b,
      price: pricingMap.MTN[b.id] ?? b.price,
    })),
    TELECEL: STATIC_BUNDLES.TELECEL.map(b => ({
      ...b,
      price: pricingMap.TELECEL[b.id] ?? b.price,
      available: true, // Enable Telecel bundles for resellers
    })),
    AIRTELTIGO: STATIC_BUNDLES.AIRTELTIGO.map(b => ({
      ...b,
      price: pricingMap.AIRTELTIGO[b.id] ?? b.price,
      available: true, // Enable AirtelTigo bundles for resellers
    })),
  };

  return result;
}

export async function generateMetadata({ params }: { params: { agentSlug: string } }): Promise<Metadata> {
  const shop = await prisma.resellerStorefront.findUnique({ where: { slug: params.agentSlug } });
  if (!shop) return { title: "Shop not found" };
  return {
    title: `${shop.displayName} — Data Bundles`,
    description: shop.bio ?? `Buy fast data bundles from ${shop.displayName} on TamalData.`,
  };
}

export default async function AgentShopPage({ params }: { params: { agentSlug: string } }) {
  const shop = await prisma.resellerStorefront.findUnique({
    where: { slug: params.agentSlug },
    include: { user: { select: { name: true, id: true } } },
  });

  if (!shop || !shop.active) notFound();

  const networks = (["MTN", "TELECEL", "AIRTELTIGO"] as const).filter((net) => {
    if (net === "MTN"        && !shop.showMTN)        return false;
    if (net === "TELECEL"    && !shop.showTelecel)    return false;
    if (net === "AIRTELTIGO" && !shop.showAirtelTigo) return false;
    return true;
  });

  // Get bundles with reseller's custom pricing
  const bundles = await getBundlesWithResellerPricing(shop.userId);

  return (
    <ShopClient
      shop={{
        slug:        shop.slug,
        displayName: shop.displayName,
        bio:         shop.bio ?? undefined,
        whatsapp:    shop.whatsapp ?? undefined,
        totalSales:  shop.totalSales,
        agentId:     shop.userId,
      }}
      networks={networks}
      bundles={bundles}
    />
  );
}
