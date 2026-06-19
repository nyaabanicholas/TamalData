import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { isValidGhanaPhone } from "@/lib/utils";

const Schema = z.object({
  phone: z.string().refine(isValidGhanaPhone, "Invalid Ghana phone number"),
  label: z.string().max(40).optional(),
});

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  // get session again for userId
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const numbers = await prisma.savedNumber.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(numbers);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const existing = await prisma.savedNumber.count({ where: { userId: session.user.id } });
  if (existing >= 20) {
    return NextResponse.json({ error: "Maximum 20 saved numbers allowed" }, { status: 400 });
  }

  const { phone, label } = parsed.data;
  const { detectNetworkFromPhone } = await import("@/lib/utils");
  const detected = detectNetworkFromPhone(phone) ?? "MTN";
  const saved = await prisma.savedNumber.create({
    data: {
      userId: session.user.id,
      phone,
      label: label ?? "",
      network: detected as "MTN" | "TELECEL" | "AIRTELTIGO",
    },
  });

  return NextResponse.json(saved, { status: 201 });
}
