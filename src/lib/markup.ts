import { prisma } from "@/lib/prisma";
import type { Network } from "@/types";

const DEFAULT_MARKUP = 0.15; // 15%

export async function getMarkupForBundle(
  network: Network,
  bundleId: string
): Promise<number> {
  // Check for bundle-specific override first
  const bundleOverride = await prisma.pricingConfig.findFirst({
    where: { bundleId, isResellerTier: false },
  });
  if (bundleOverride) return Number(bundleOverride.markupPercent) / 100;

  // Check for network-level override
  const networkOverride = await prisma.pricingConfig.findFirst({
    where: { network, bundleId: null, isResellerTier: false },
  });
  if (networkOverride) return Number(networkOverride.markupPercent) / 100;

  // Fall back to global config
  const global = await prisma.pricingConfig.findFirst({
    where: { isGlobal: true, isResellerTier: false },
  });
  if (global) return Number(global.markupPercent) / 100;

  return DEFAULT_MARKUP;
}

/**
 * Compute the effective selling price for a bundle.
 *
 * Priority:
 * 1. PricingConfig override (bundle-specific → network → global)
 * 2. cheapdata.shop recommended price (from local bundle definitions)
 * 3. costPrice + default 15% markup
 *
 * Returns the selling price and the net markup rate that was applied.
 */
export async function getEffectivePrice(
  network: Network,
  bundleId: string,
  costPrice: number,
  recommendedPrice: number,
): Promise<{ sellPrice: number; markupRate: number }> {
  // Check PricingConfig hierarchy
  const bundleOverride = await prisma.pricingConfig.findFirst({
    where: { bundleId, isResellerTier: false },
  });
  if (bundleOverride) {
    const rate = Number(bundleOverride.markupPercent) / 100;
    return { sellPrice: applyMarkup(costPrice, rate), markupRate: rate };
  }

  const networkOverride = await prisma.pricingConfig.findFirst({
    where: { network, bundleId: null, isResellerTier: false },
  });
  if (networkOverride) {
    const rate = Number(networkOverride.markupPercent) / 100;
    return { sellPrice: applyMarkup(costPrice, rate), markupRate: rate };
  }

  const global = await prisma.pricingConfig.findFirst({
    where: { isGlobal: true, isResellerTier: false },
  });
  if (global) {
    const rate = Number(global.markupPercent) / 100;
    return { sellPrice: applyMarkup(costPrice, rate), markupRate: rate };
  }

  // No override found: use recommended price from cheapdata.shop
  return { sellPrice: recommendedPrice, markupRate: 0 };
}

export function applyMarkup(costPrice: number, markupRate: number): number {
  return Math.ceil(costPrice * (1 + markupRate) * 100) / 100;
}

/**
 * Batch-price a list of bundles in ONE round of DB reads (instead of N×3 queries
 * via getEffectivePrice). Loads the whole PricingConfig table once, then resolves
 * each bundle against the bundle → network → global hierarchy in memory.
 *
 * Returns a map bundleId → { sellPrice, costPrice }. The sellPrice reflects any
 * admin override so the buy page DISPLAYS the same price the order route CHARGES.
 */
export async function priceBundles(
  bundles: { id: string; network: Network; costPrice: number; recommendedPrice: number }[],
): Promise<Record<string, { sellPrice: number; costPrice: number }>> {
  const configs = await prisma.pricingConfig.findMany({
    where: { isResellerTier: false },
  });

  const byBundle = new Map<string, number>();
  const byNetwork = new Map<string, number>();
  let globalRate: number | null = null;

  for (const c of configs) {
    const rate = Number(c.markupPercent) / 100;
    if (c.bundleId) byBundle.set(c.bundleId, rate);
    else if (c.isGlobal) globalRate = rate;
    else if (c.network) byNetwork.set(c.network, rate);
  }

  const out: Record<string, { sellPrice: number; costPrice: number }> = {};
  for (const b of bundles) {
    let sellPrice: number;
    if (byBundle.has(b.id)) {
      sellPrice = applyMarkup(b.costPrice, byBundle.get(b.id)!);
    } else if (byNetwork.has(b.network)) {
      sellPrice = applyMarkup(b.costPrice, byNetwork.get(b.network)!);
    } else if (globalRate !== null) {
      sellPrice = applyMarkup(b.costPrice, globalRate);
    } else {
      sellPrice = b.recommendedPrice;
    }
    out[b.id] = { sellPrice, costPrice: b.costPrice };
  }
  return out;
}

export function generateOrderReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TAMAL-${dateStr}-${random}`;
}
