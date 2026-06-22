import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export interface AppUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  walletBalance: number;
  authId: string;
}

export interface AppSession {
  user: AppUser;
}

/**
 * Server-side session helper — drop-in replacement for NextAuth's auth().
 * Returns null when unauthenticated; AppSession otherwise.
 * All 28 callsites use session.user.id which maps to the Prisma User id (cuid).
 */
export async function auth(): Promise<AppSession | null> {
  try {
    const supabase = await createClient();

    // Verify the session via getClaims(): for asymmetric JWTs this is a LOCAL
    // verification (no network round-trip → fast) and, crucially, it does NOT
    // trigger a token refresh. That avoids the concurrent refresh-token rotation
    // that was invalidating sessions and forcing re-login on every page.
    // The single refresh still happens once per request in middleware.
    let authId: string | undefined;

    // getClaims() is local/fast but may not exist in older SDK versions — wrap in
    // its own try so a TypeError falls through to getSession() rather than being
    // caught by the outer catch and returning null immediately.
    try {
      const { data: claimsData, error } = await supabase.auth.getClaims();
      if (!error && claimsData?.claims?.sub) {
        authId = claimsData.claims.sub as string;
      }
    } catch { /* getClaims not available in this SDK version */ }

    if (!authId) {
      // Middleware refreshes the token on every request, so getSession() reads a
      // fresh JWT from the cookie without a network call.
      const { data: sessionData } = await supabase.auth.getSession();
      authId = sessionData?.session?.user?.id;
    }

    if (!authId) return null;

    const user = await prisma.user.findUnique({
      where: { authId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        authId: true,
      },
    });

    if (!user || !user.authId) return null;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: Number(user.walletBalance),
        authId: user.authId,
      },
    };
  } catch {
    return null;
  }
}
