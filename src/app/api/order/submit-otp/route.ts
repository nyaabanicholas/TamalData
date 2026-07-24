import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { submitOtp } from "@/lib/paystack";
import { orderRateLimit, getClientIp } from "@/lib/ratelimit";

const OtpSchema = z.object({
  reference: z.string().min(1),
  otp: z.string().min(3).max(10),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (orderRateLimit) {
    const { success: allowed } = await orderRateLimit.limit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = OtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the code you received." }, { status: 400 });
  }

  try {
    const result = await submitOtp(parsed.data);

    if (!result.status) {
      return NextResponse.json(
        { error: result.message ?? "Incorrect code. Please try again." },
        { status: 400 },
      );
    }

    // Charge is now authorized; the Paystack webhook confirms + delivers.
    return NextResponse.json({
      success: true,
      chargeStatus: result.data?.status ?? null,
      display_text: result.data?.display_text ?? null,
    });
  } catch (error) {
    console.error("[/api/order/submit-otp] error:", error);
    return NextResponse.json(
      { error: "Could not verify code. Please try again." },
      { status: 502 },
    );
  }
}
