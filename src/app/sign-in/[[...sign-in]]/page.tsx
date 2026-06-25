"use client";

import { SignIn, AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function SignInPage() {
  const pathname = usePathname();

  if (pathname?.includes("sso-callback")) {
    return (
      <>
        <div id="clerk-captcha" />
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
