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
    const redirectResponse = NextResponse.redirect(url);
    // Copy any refreshed session cookies so the browser stores them even on
    // redirect — without this, token refreshes are discarded and the user's
    // next request still uses the expired cookie.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
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
