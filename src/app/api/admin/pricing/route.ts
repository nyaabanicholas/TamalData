import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const configs = await prisma.pricingConfig.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(configs);
}

const schema = z.object({
  // Update existing global tier rows by ID
  configs: z.array(z.object({
    id:            z.string(),
    markupPercent: z.number().min(0).max(500),
  })).optional(),
  // Replace per-bundle sell prices (sent as full list per network)
  bundles: z.array(z.object({
    bundleId:  z.string(),
    network:   z.enum(["MTN", "TELECEL", "AIRTELTIGO"]),
    costPrice: z.number().positive(),
    sellPrice: z.number().positive(),
  })).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    if (parsed.data.configs?.length) {
      for (const c of parsed.data.configs) {
        await tx.pricingConfig.update({
          where: { id: c.id },
          data:  { markupPercent: c.markupPercent },
        });
      }
    }

    if (parsed.data.bundles?.length) {
      const bundleIds = parsed.data.bundles.map((b) => b.bundleId);
      // Delete existing per-bundle configs for these IDs
      await tx.pricingConfig.deleteMany({
        where: { bundleId: { in: bundleIds }, isResellerTier: false },
      });
      // Recreate with computed markup
      await tx.pricingConfig.createMany({
        data: parsed.data.bundles.map((b) => ({
          bundleId:       b.bundleId,
          network:        b.network,
          markupPercent:  ((b.sellPrice / b.costPrice) - 1) * 100,
          isGlobal:       false,
          isResellerTier: false,
          label:          `${b.network} – ${b.bundleId}`,
        })),
      });
    }
  });

  return NextResponse.json({ success: true });
}
