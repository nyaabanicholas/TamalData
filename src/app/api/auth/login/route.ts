import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Use Clerk sign-in at /sign-in" }, { status: 410 });
}
