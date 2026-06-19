import { NextResponse } from "next/server";
import { getBalance } from "@/lib/datamart";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const balance = await getBalance();
    return NextResponse.json(balance);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch DataMart balance" },
      { status: 502 }
    );
  }
}
