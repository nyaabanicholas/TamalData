import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  mtnStatus:        z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
  telecelStatus:    z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
  airteltigoStatus: z.enum(["OPERATIONAL", "DEGRADED", "DOWN"]),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ success: true });
}
