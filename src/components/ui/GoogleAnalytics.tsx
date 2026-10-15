"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_ID = "G-EE512GNC3L";

// GA4 tag for public + customer pages. Admin traffic is excluded so staff
// visits don't skew SEO data. SPA page_views come from GA4 enhanced measurement
// (history changes), so no manual page_view calls are needed.
export function GoogleAnalytics() {
  const isAdmin = usePathname().startsWith("/admin");

  // Set during render: Next pushes history after commit, so the flag is in
  // place before GA's history listener sees an /admin navigation.
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = isAdmin;
  }

  // Landing straight on /admin never loads the tag. If it loaded earlier, the
  // disable flag above stops hits.
  if (isAdmin) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
