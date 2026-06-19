import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Network } from "@prisma/client";

// Schema for saving custom pricing for a single bundle
const PricingSchema = z.object({
  network: z.enum(["MTN", "TELECEL", "AIRTELTIGO"]),
  bundleId: z.string(),
  customPrice: z.number().min(0),
});

// Schema for saving pricing for all bundles at once
const BulkPricingSchema = z.object({
  MTN: z.record(z.number().min(0)).optional(),
  TELECEL: z.record(z.number().min(0)).optional(),
  AIRTELTIGO: z.record(z.number().min(0)).optional(),
});

// Get reseller's custom pricing
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all custom pricing for this user
    const pricing = await prisma.resellerPricing.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { network: "asc" },
    });

    // Build a structured response
    const result: Record<Network, Record<string, number>> = {
      MTN: {},
      TELECEL: {},
      AIRTELTIGO: {},
    };

    pricing.forEach((p) => {
      result[p.network as Network][p.bundleId] = parseFloat(p.customPrice.toString());
    });

    return NextResponse.json({ pricing: result });
  } catch (error) {
    console.error("[/api/reseller/pricing] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing" },
      { status: 500 }
    );
  }
}

// Save reseller's custom pricing (PUT for upsert)
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Try to parse as bulk pricing first
    const bulkParsed = BulkPricingSchema.safeParse(body);
    if (bulkParsed.success) {
      const { MTN, TELECEL, AIRTELTIGO } = bulkParsed.data;
      
      // Delete all existing pricing for this user
      await prisma.resellerPricing.deleteMany({
        where: { userId: session.user.id },
      });

      // Insert new pricing entries
      const entries: {
        userId: string;
        network: Network;
        bundleId: string;
        customPrice: string;
      }[] = [];
      
      if (MTN) {
        Object.entries(MTN).forEach(([bundleId, customPrice]) => {
          entries.push({
            userId: session.user.id,
            network: "MTN" as Network,
            bundleId,
            customPrice: String(customPrice),
          });
        });
      }

      if (TELECEL) {
        Object.entries(TELECEL).forEach(([bundleId, customPrice]) => {
          entries.push({
            userId: session.user.id,
            network: "TELECEL" as Network,
            bundleId,
            customPrice: String(customPrice),
          });
        });
      }

      if (AIRTELTIGO) {
        Object.entries(AIRTELTIGO).forEach(([bundleId, customPrice]) => {
          entries.push({
            userId: session.user.id,
            network: "AIRTELTIGO" as Network,
            bundleId,
            customPrice: String(customPrice),
          });
        });
      }

      if (entries.length > 0) {
        await prisma.resellerPricing.createMany({
          data: entries,
          skipDuplicates: true,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Pricing saved successfully",
        count: entries.length,
      });
    }

    // Try to parse as single pricing
    const singleParsed = PricingSchema.safeParse(body);
    if (singleParsed.success) {
      const { network, bundleId, customPrice } = singleParsed.data;

      const pricing = await prisma.resellerPricing.upsert({
        where: {
          userId_network_bundleId: {
            userId: session.user.id,
            network: network,
            bundleId: bundleId,
          },
        },
        create: {
          userId: session.user.id,
          network: network,
          bundleId: bundleId,
          customPrice: String(customPrice),
          isActive: true,
        },
        update: {
          customPrice: String(customPrice),
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(pricing);
    }

    return NextResponse.json(
      { error: "Invalid pricing data format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[/api/reseller/pricing] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save pricing" },
      { status: 500 }
    );
  }
}

// Delete reseller pricing (for reset)
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.resellerPricing.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Pricing reset successfully",
    });
  } catch (error) {
    console.error("[/api/reseller/pricing] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to reset pricing" },
      { status: 500 }
    );
  }
}
