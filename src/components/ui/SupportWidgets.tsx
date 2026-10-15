"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { WhatsAppFAB } from "./WhatsAppFAB";

const TawkToWidget = dynamic(() => import("./TawkToWidget").then((m) => m.TawkToWidget), { ssr: false });

// Customer support bubbles. Hidden on /admin: staff don't need them and they cover the admin rail.
export function SupportWidgets() {
  if (usePathname().startsWith("/admin")) return null;
  return (
    <>
      <WhatsAppFAB />
      <TawkToWidget />
    </>
  );
}
