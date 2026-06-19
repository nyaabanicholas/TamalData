import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackClient } from "./TrackClient";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your TamalData order in real time.",
};

export default function TrackPage() {
  return (
    <>
      <main className="cinematic min-h-screen pt-32 pb-20">
        <div className="container-content max-w-2xl mx-auto px-4">
          <h1 className="font-heading text-text-primary text-5xl md:text-6xl tracking-[-2px] leading-[0.9] mb-3 text-center">
            Track Order
          </h1>
          <p className="text-text-secondary text-center mb-10 font-barlow font-light">
            Enter your order reference to see real-time delivery status.
          </p>
          <Suspense fallback={<div className="liquid-glass h-40 rounded-[1.25rem]" />}>
            <TrackClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
