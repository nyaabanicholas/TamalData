"use client";

import Script from "next/script";

const TAWK_PROPERTY_ID = "659f570b8d261e1b5f51bce7";
const TAWK_WIDGET_ID = "1hjr6o1jg";

export function TawkToWidget() {
  return (
    <Script
      strategy="lazyOnload"
      src={`https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`}
    />
  );
}
