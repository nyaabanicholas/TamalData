import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!settings) return NextResponse.json({ status: "OPERATIONAL" });

    const statuses = [settings.mtnStatus, settings.telecelStatus, settings.airteltigoStatus];
    let status = "OPERATIONAL";
    if (statuses.includes("DOWN")) status = "DOWN";
    else if (statuses.includes("DEGRADED")) status = "DEGRADED";

    return NextResponse.json({
      status,
      mtn: settings.mtnStatus,
      telecel: settings.telecelStatus,
      airteltigo: settings.airteltigoStatus,
    });
  } catch {
    return NextResponse.json({ status: "OPERATIONAL" });
  }
}
