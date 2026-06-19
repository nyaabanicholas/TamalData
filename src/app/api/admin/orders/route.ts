import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const network = searchParams.get("network");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(network ? { network: network as never } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true, phone: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}
