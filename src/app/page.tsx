import { Hero } from "@/components/landing/Hero";
import { NetworkTeaser } from "@/components/landing/NetworkTeaser";
import { WhySection } from "@/components/landing/WhySection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { ResellerBanner } from "@/components/landing/ResellerBanner";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { Footer } from "@/components/landing/Footer";
import { CHEAPEST_BY_NETWORK } from "@/lib/staticBundles";
import type { NetworkStatus } from "@/types";

export const revalidate = 3600;

async function getNetworkStatuses(): Promise<NetworkStatus[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/networks/status`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return [
      { network: "MTN",        status: "OPERATIONAL", lastChecked: new Date().toISOString() },
      { network: "TELECEL",    status: "OPERATIONAL", lastChecked: new Date().toISOString() },
      { network: "AIRTELTIGO", status: "OPERATIONAL", lastChecked: new Date().toISOString() },
    ];
  }
}

export default async function HomePage() {
  const statuses = await getNetworkStatuses();

  return (
    <main>
      <Hero />
      <NetworkTeaser statuses={statuses} cheapestPrices={CHEAPEST_BY_NETWORK} />
      <WhySection />
      <PricingPreview />
      <ResellerBanner />
      <FaqAccordion />
      <Footer />
    </main>
  );
}
