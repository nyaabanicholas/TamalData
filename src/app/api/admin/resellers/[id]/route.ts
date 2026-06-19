import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["APPROVED", "SUSPENDED", "PENDING_APPROVAL"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: params.id },
    data:  { resellerStatus: parsed.data.status },
    select: { id: true, name: true, resellerStatus: true },
  });

  return NextResponse.json(user);
}
