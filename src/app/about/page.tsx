import type { Metadata } from "next";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { ShieldCheck, Zap, Award } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about TamalData, Ghana's cheapest data bundle marketplace.",
};

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen">
        {/* Hero */}
        <section className="pt-36 pb-16 md:pb-20 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="font-heading text-text-primary text-5xl lg:text-6xl tracking-tight leading-[1.02] mb-6">
              Ghana&apos;s cheapest data bundles
            </h1>
            <p className="mx-auto max-w-[60ch] text-text-secondary text-lg leading-relaxed font-barlow text-pretty">
              We buy MTN, Telecel and AirtelTigo data from wholesale partners and pass the
              savings straight to you. Pay with Mobile Money, no account needed, and your
              bundle usually lands within minutes.
            </p>
          </div>
        </section>

        {/* Proof points */}
        <section className="pb-20 md:pb-28">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-4 sm:grid-cols-3">
            {[
              { icon: Award, value: "30,000+", label: "Orders delivered across Ghana" },
              { icon: Zap, value: "10-30 min", label: "Typical delivery time" },
              { icon: ShieldCheck, value: "MoMo", label: "Secure checkout via Paystack" },
            ].map((p) => (
              <div key={p.label} className="liquid-glass rounded-[1.25rem] p-6">
                <p.icon className="h-5 w-5 text-accent-primary" strokeWidth={1.5} />
                <p className="mt-6 font-display text-3xl font-semibold tracking-tight tabular-nums text-text-primary">{p.value}</p>
                <p className="mt-1 text-sm text-text-secondary">{p.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="pb-24">
          <div className="mx-auto max-w-4xl px-4">
            <div className="liquid-glass flex flex-col items-start justify-between gap-6 rounded-[1.5rem] p-8 md:flex-row md:items-center md:p-10">
              <div>
                <h2 className="font-heading text-text-primary text-3xl tracking-tight">Need a hand?</h2>
                <p className="mt-2 text-text-secondary font-barlow">Our team answers on WhatsApp and email, every day.</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-accent-primary px-5 py-2.5 font-semibold text-white transition-transform duration-200 active:scale-[0.98]"
                >
                  WhatsApp us
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="rounded-full px-5 py-2.5 font-medium text-text-secondary ring-1 ring-inset ring-color-border transition-colors hover:text-text-primary"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="faq">
          <FaqAccordion />
        </section>
      </main>
    </>
  );
}
