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

    // getUser() validates the JWT against Supabase's auth server — reliable in
    // Node.js runtime (server components, route handlers). Falls back to
    // getSession() which handles token refresh via the refresh token cookie.
    let authId: string | undefined;

    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      authId = userData.user.id;
    } else {
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
