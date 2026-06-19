import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/utils/supabase/admin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const LoginSchema = z.object({
  login: z.string().min(1),   // phone or email
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const { login, password } = parsed.data;

  // ── 1. Try Prisma-backed login first (supports seed/admin accounts) ────────
  const isEmail = login.includes("@");
  const dbUser = await prisma.user.findFirst({
    where: isEmail ? { email: login } : { phone: login },
    select: { id: true, authId: true, name: true, phone: true, passwordHash: true, role: true, email: true },
  });

  if (dbUser && await bcrypt.compare(password, dbUser.passwordHash).catch(() => false)) {
    // Password matches — user is authenticated via bcrypt.
    // Now we need a Supabase session. Try signing in; if the account doesn't
    // exist, create it on-the-fly, then sign in to set cookies.
    const emailForAuth = dbUser.email ?? `${dbUser.phone}@tamaldata.internal`;

    if (dbUser.authId) {
      // User has a Supabase Auth account — try signing in
      const response = NextResponse.json({ ok: true });
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return req.cookies.getAll(); },
            setAll(cookiesToSet) {
              for (const { name, value, options } of cookiesToSet) {
                response.cookies.set(name, value, options);
              }
            },
          },
        }
      );

      const { error } = await supabase.auth.signInWithPassword({ email: emailForAuth, password });
      if (!error) return response;

      // If email not confirmed, auto-confirm and retry
      if (error.message?.toLowerCase().includes("email not confirmed") || error.code === "email_not_confirmed") {
        try {
          const adminClient = createAdminClient();
          await adminClient.auth.admin.updateUserById(dbUser.authId, { email_confirm: true });
          const { error: retryError } = await supabase.auth.signInWithPassword({ email: emailForAuth, password });
          if (!retryError) return response;
        } catch { /* fall through to create a new auth user */ }
      }

      // Existing authId is broken/deleted — fall through to recreate
    }

    // No Supabase Auth account (or broken one) — create one on the fly
    try {
      const adminClient = createAdminClient();
      // If there was a broken authId, delete it first to avoid conflicts
      if (dbUser.authId) {
        await adminClient.auth.admin.deleteUser(dbUser.authId).catch(() => null);
      }

      const { data: newAuth, error: createError } = await adminClient.auth.admin.createUser({
        email: emailForAuth,
        password,
        email_confirm: true,
        user_metadata: { prisma_id: dbUser.id, role: dbUser.role },
      });

      if (createError || !newAuth?.user) {
        console.error("[/api/auth/login] Failed to create auth user:", createError);
        return NextResponse.json({ error: "Account setup failed. Please contact support." }, { status: 500 });
      }

      // Link the auth user to the Prisma user
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { authId: newAuth.user.id },
      });

      // Sign in with the newly created auth account
      const response = NextResponse.json({ ok: true });
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return req.cookies.getAll(); },
            setAll(cookiesToSet) {
              for (const { name, value, options } of cookiesToSet) {
                response.cookies.set(name, value, options);
              }
            },
          },
        }
      );
      await supabase.auth.signInWithPassword({ email: emailForAuth, password });
      return response;
    } catch (err) {
      console.error("[/api/auth/login] Auth account creation error:", err);
      return NextResponse.json({ error: "Could not set up login. Please contact support." }, { status: 500 });
    }
  }

  // ── 2. Fallback to standard Supabase Auth sign-in ─────────────────────────
  const email = login.includes("@") ? login : `${login}@tamaldata.internal`;
  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const isEmailNotConfirmed = error.message?.toLowerCase().includes("email not confirmed") || error.code === "email_not_confirmed";
    if (isEmailNotConfirmed && dbUser?.authId) {
      try {
        const adminClient = createAdminClient();
        await adminClient.auth.admin.updateUserById(dbUser.authId, { email_confirm: true });
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
        if (!retryError) return response;
      } catch { /* fall through */ }
    }

    return NextResponse.json({
      error: error.message || "Invalid phone/email or password.",
    }, { status: 401 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Invalid phone/email or password." }, { status: 401 });
  }

  return response;
}
