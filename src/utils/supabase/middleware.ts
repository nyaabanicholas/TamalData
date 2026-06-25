import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession() in Edge middleware — it reads the JWT locally from cookies
  // without a network round-trip to Supabase. getUser() always makes a network
  // call which can fail on Edge Runtime (timeouts, rate limits) and causes valid
  // sessions to appear null, logging the user out on every page navigation.
  // Actual cryptographic JWT validation happens in server components / route
  // handlers via auth() which calls getUser() in the Node.js runtime.
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user ?? null;

  return { supabaseResponse, user };
}
