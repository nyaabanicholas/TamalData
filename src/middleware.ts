import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Edge-compatible: no Prisma. Admin role check happens in src/app/admin/layout.tsx (server component).
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/reseller");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on ALL routes (not just protected ones) so Supabase session cookies
    // are refreshed on every request — required by the official SSR pattern.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
