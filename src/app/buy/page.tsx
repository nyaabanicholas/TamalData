import type { Metadata } from "next";
import { BuyWizard } from "@/components/buy/BuyWizard";
import { DeliveryStatusBanner } from "@/components/buy/DeliveryStatusBanner";
import type { Network } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Data",
  description: "Buy MTN, Telecel, AirtelTigo data bundles online. Fast delivery to your number.",
};

interface Props {
  searchParams: { network?: string; bundle?: string };
}

export default function BuyPage({ searchParams }: Props) {
  const network = (searchParams.network?.toUpperCase() ?? null) as Network | null;

  return (
    <main className="min-h-screen">
      {/* Page header — theme-aware */}
      <div className="pt-28 min-h-[40vh] flex items-center justify-center relative">
        <div className="text-center px-4 relative z-10">
          <div className="inline-block liquid-glass rounded-3xl px-8 py-6 mb-6">
            <h1 className="font-heading text-text-primary text-4xl md:text-5xl leading-tight mb-3">
              Buy Data
            </h1>
            <p className="text-text-secondary font-barlow font-light">
              Pick your network, choose a bundle, and get fast delivery.
            </p>
          </div>
        </div>
      </div>
      {/* Network status banner - centered */}
      <div className="container-content px-4">
        <DeliveryStatusBanner />
      </div>

      {/* Wizard — dark-themed checkout flow */}
      <div className="relative z-10">
        <BuyWizard defaultNetwork={network ?? undefined} />
      </div>
    </main>
  );
}
