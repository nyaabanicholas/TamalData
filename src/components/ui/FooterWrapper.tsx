"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/landing/Footer";

const HIDE_FOOTER_PATHS = ["/dashboard", "/admin", "/reseller"];

export function FooterWrapper() {
  const pathname = usePathname();
  const hide = HIDE_FOOTER_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (hide) return null;
  return <Footer />;
}
