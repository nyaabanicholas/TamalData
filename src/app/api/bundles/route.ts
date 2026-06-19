import { NextResponse, type NextRequest } from "next/server";
import { redis, CACHE_TTL } from "@/lib/redis";
import { priceBundles } from "@/lib/markup";
import { STATIC_BUNDLES, ALL_STATIC_BUNDLES } from "@/lib/staticBundles";
import type { Network } from "@/types";

export const dynamic = "force-dynamic";

// The buy page and admin pricing editor both key off STATIC_BUNDLES ids
// (e.g. "mtn-5gb"). Pricing the SAME ids here guarantees the price the customer
// sees == the price the order route charges via getEffectivePrice.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network")?.toUpperCase() as Network | null;

    const source =
      network && STATIC_BUNDLES[network] ? STATIC_BUNDLES[network] : ALL_STATIC_BUNDLES;

    const cacheKey = `bundles:${network ?? "all"}`;
    const cached = redis ? await redis.get(cacheKey).catch(() => null) : null;
    if (cached) return NextResponse.json(cached);

    // STATIC_BUNDLES prices are the retail baseline → treat as both cost and
    // recommended; admin PricingConfig overrides take priority when present.
    const priced = await priceBundles(
      source.map((b) => ({
        id: b.id,
        network: b.network as Network,
        costPrice: b.price,
        recommendedPrice: b.price,
      })),
    );

    const bundles = source.map((b) => ({
      id: b.id,
      network: b.network,
      size: b.size,
      validity: b.validity,
      type: b.type,
      available: b.available,
      price: priced[b.id]?.sellPrice ?? b.price,
      costPrice: b.price,
    }));

    if (redis) {
      await redis.set(cacheKey, bundles, { ex: CACHE_TTL.BUNDLES }).catch(() => null);
    }

    return NextResponse.json(bundles);
  } catch (error) {
    console.error("[/api/bundles] Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch bundles. Please try again shortly." },
      { status: 503 },
    );
  }
}
