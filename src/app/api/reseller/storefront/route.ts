import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  userId:        z.string().optional(),
  slug:           z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
  displayName:    z.string().min(2).max(80),
  whatsapp:       z.string().optional(),
  bio:            z.string().max(200).optional(),
  showMTN:        z.boolean(),
  showTelecel:    z.boolean(),
  showAirtelTigo: z.boolean(),
  active:         z.boolean(),
});

// Get storefront by slug (public endpoint - no auth required)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  
  if (!slug) {
    return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
  }

  try {
    const storefront = await prisma.resellerStorefront.findUnique({
      where: { slug },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!storefront) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
    }

    return NextResponse.json(storefront);
  } catch (error) {
    console.error("[/api/reseller/storefront] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch storefront" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  // Check slug uniqueness (excluding self)
  const existing = await prisma.resellerStorefront.findUnique({ where: { slug: parsed.data.slug } });
  if (existing && existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Slug already taken. Choose a different one." }, { status: 409 });
  }

  const storefront = await prisma.resellerStorefront.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: { ...parsed.data },
  });

  return NextResponse.json(storefront);
}
