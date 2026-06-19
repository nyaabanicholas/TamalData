import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function getAdminSession() {
  return auth();
}

export async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
