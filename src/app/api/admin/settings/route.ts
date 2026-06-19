import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  maintenanceMode:    z.boolean(),
  maintenanceBanner:  z.string().max(200).optional(),
  referralCommission: z.number().min(0).max(1),
  minPayoutAmount:    z.number().min(1),
  mtnStatus:          z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
  telecelStatus:      z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
  airteltigoStatus:   z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
});

export async function GET() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const settings = await prisma.siteSettings.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(settings);
}
