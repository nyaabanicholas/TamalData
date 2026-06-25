import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
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
 * Server-side session helper backed by Clerk.
 * Returns null when unauthenticated; AppSession otherwise.
 * All callsites import { auth } from "@/lib/auth" — unchanged.
 */
export async function auth(): Promise<AppSession | null> {
  try {
    const { userId } = await clerkAuth();
    if (!userId) return null;

    // Find Prisma user by Clerk ID
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, walletBalance: true, authId: true },
    });

    if (!user) {
      // First login — try to link by email to an existing Prisma user (migration path)
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress ?? null;

      if (email) {
        const existing = await prisma.user.findFirst({ where: { email } });
        if (existing) {
          user = await prisma.user.update({
            where: { id: existing.id },
            data: { clerkId: userId },
            select: { id: true, name: true, email: true, phone: true, role: true, walletBalance: true, authId: true },
          });
        }
      }

      // Brand-new Clerk user with no Prisma record — auto-create minimal profile
      if (!user && clerkUser) {
        const phone =
          clerkUser.phoneNumbers[0]?.phoneNumber ||
          `clerk_${userId}`;
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            name: clerkUser.fullName || email || "User",
            phone,
            email,
            role: "USER",
            referralCode: `CLK${userId.slice(-6).toUpperCase()}`,
          },
          select: { id: true, name: true, email: true, phone: true, role: true, walletBalance: true, authId: true },
        });
      }
    }

    if (!user) return null;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: Number(user.walletBalance),
        authId: user.authId ?? userId,
      },
    };
  } catch {
    return null;
  }
}
