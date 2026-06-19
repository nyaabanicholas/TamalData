import { NextResponse } from "next/server";
import { redis, CACHE_TTL } from "@/lib/redis";

const NETWORKS = ["MTN", "TELECEL", "AIRTELTIGO"] as const;

export async function GET() {
  try {
    const statuses = await Promise.all(
      NETWORKS.map(async (network) => {
        const override = redis
          ? await redis.get<string>(`network:status:${network}`).catch(() => null)
          : null;

        return {
          network,
          status: override ?? "OPERATIONAL",
          lastChecked: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json(statuses, {
      headers: { "Cache-Control": `s-maxage=${CACHE_TTL.NETWORK_STATUS}` },
    });
  } catch {
    return NextResponse.json(
      NETWORKS.map((network) => ({
        network,
        status: "OPERATIONAL",
        lastChecked: new Date().toISOString(),
      }))
    );
  }
}
