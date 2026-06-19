import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GHANA_PHONE = /^0[2345][0-9]{8}$/;

const RegisterSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(GHANA_PHONE, "Invalid Ghana phone number"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6),
  role: z.enum(["USER", "RESELLER"]).default("USER"),
  referralCode: z.string().optional(),
});

function makeReferralCode(name: string): string {
  const base = name.toUpperCase().replace(/\s+/g, "").slice(0, 4);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${rand}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email, password, role, referralCode } = parsed.data;
  const loginEmail = email || `${phone}@tamaldata.internal`;

  const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "Phone number already registered." }, { status: 409 });

  let referredById: string | null = null;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode }, select: { id: true } });
    referredById = referrer?.id ?? null;
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: loginEmail,
    password,
    options: { data: { name, phone } },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Registration failed" }, { status: 400 });
  }

  const authId = authData.user.id;

  // Auto-confirm the user's email so they can sign in immediately
  try {
    const adminClient = createAdminClient();
    await adminClient.auth.admin.updateUserById(authId, { email_confirm: true });
  } catch {
    // If admin confirmation fails (e.g. missing service role key),
    // the user may need to check their email — but since we use
    // synthetic emails, prompt them to try logging in anyway.
    console.warn("[register] Could not auto-confirm email via admin API — user may need manual confirmation");
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        authId,
        name,
        phone,
        email: email || null,
        passwordHash: "",
        role: role === "RESELLER" ? "RESELLER" : "USER",
        referralCode: makeReferralCode(name),
        referredById,
        resellerStatus: role === "RESELLER" ? "PENDING_APPROVAL" : null,
      },
    });
    return NextResponse.json({ userId: newUser.id });
  } catch (err) {
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.deleteUser(authId);
    } catch {
      // fallback — delete via regular client
      await supabase.auth.admin.deleteUser(authId).catch(() => null);
    }
    console.error("[register] Prisma error:", err);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
