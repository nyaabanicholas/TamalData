import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedNumber.findUnique({ where: { id: params.id } });
  if (!saved || saved.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.savedNumber.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
