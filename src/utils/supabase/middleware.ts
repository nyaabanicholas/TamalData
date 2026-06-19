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

  // Primary: verify the access token via Supabase API.
  // Falls back to getSession() (local, no network) when getUser() fails —
  // handles transient API errors, rate limits, and Supabase cold starts
  // so legitimate sessions aren't lost to false negatives.
  let user;
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const { data: sessionData } = await supabase.auth.getSession();
    user = sessionData?.session?.user ?? null;
  } else {
    user = data.user;
  }

  return { supabaseResponse, user };
}
