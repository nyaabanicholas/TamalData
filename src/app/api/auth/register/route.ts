import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Use Clerk sign-up at /sign-up" }, { status: 410 });
}
