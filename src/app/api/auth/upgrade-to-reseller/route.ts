import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpgradeSchema = z.object({
  mode: z.enum(["upgrade", "new"]).optional().default("upgrade"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mode } = UpgradeSchema.parse(body);

    if (mode === "upgrade") {
      // Check if user is already a reseller
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, resellerStatus: true },
      });

      if (user?.role === "RESELLER") {
        return NextResponse.json(
          { 
            error: "Already a reseller",
            message: "You are already registered as a reseller.",
            redirected: user.resellerStatus === "APPROVED" ? "/reseller" : "/reseller/onboarding",
          },
          { status: 400 }
        );
      }

      // Upgrade existing account to reseller with pending approval
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: "RESELLER",
          resellerStatus: "PENDING_APPROVAL",
        },
      });

      return NextResponse.json({
        success: true,
        upgraded: true,
        message: "Account upgraded to reseller. Pending admin approval.",
        nextStep: "/reseller/onboarding",
      });
    }

    // For "new" mode, redirect to registration
    return NextResponse.json({
      success: true,
      upgraded: false,
      redirect: "/auth/register?role=reseller",
      message: "Please create a new reseller account.",
    });
  } catch (error) {
    console.error("[/api/auth/upgrade-to-reseller] error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade account" },
      { status: 500 }
    );
  }
}
