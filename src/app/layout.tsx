import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Fauna_One, Barlow } from "next/font/google";
import dynamic from "next/dynamic";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/ui/Navbar";
import { Preloader } from "@/components/ui/Preloader";
import "./globals.css";

const TawkToWidget = dynamic(
  () => import("@/components/ui/TawkToWidget").then((m) => m.TawkToWidget),
  { ssr: false }
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  display: "swap",
});

const faunaOne = Fauna_One({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "400",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-body-barlow",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TamalData — Ghana's Cheapest Data Bundles | MTN, Telecel, AirtelTigo",
    template: "%s | TamalData",
  },
  description:
    "Buy MTN, Telecel, AirtelTigo data bundles online. Lowest prices in Ghana. No account needed.",
  keywords: [
    "buy data Ghana",
    "cheap data bundles Ghana",
    "MTN data bundles",
    "Telecel data",
    "AirtelTigo data",
    "data reseller Ghana",
    "TamalData",
  ],
  openGraph: {
    title: "TamalData — Ghana's Cheapest Data Bundles",
    description:
      "Buy MTN, Telecel, AirtelTigo data bundles from GH₵4.50. Fast delivery. Lowest prices in Ghana.",
    url: "https://tamaldata.com",
    siteName: "TamalData",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "TamalData" }],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TamalData — Ghana's Cheapest Data Bundles",
    description: "MTN, Telecel, AirtelTigo data from GH₵4.50. Fast delivery.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${faunaOne.variable} ${barlow.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg-base text-text-primary antialiased">
        <Providers>
          <Preloader />
          {/* Global orb layer — fixed between body bg and content */}
          <div
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
            aria-hidden="true"
          >
            <div className="global-orb global-orb-1" />
            <div className="global-orb global-orb-2" />
            <div className="global-orb global-orb-accent" />
          </div>
          <Navbar />
          {children}
          <TawkToWidget />
        </Providers>
      </body>
    </html>
  );
}
