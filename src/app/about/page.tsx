import type { Metadata } from "next";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { Footer } from "@/components/landing/Footer";
import { ShieldCheck, Zap, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about TamalData — Ghana's cheapest data bundle marketplace.",
};

export default function AboutPage() {
  return (
    <>
      <main className="cinematic min-h-screen">
        {/* Hero */}
        <section className="section-padding text-center pt-32">
          <div className="container-content max-w-3xl mx-auto px-4">
            <div className="font-heading text-text-primary text-4xl tracking-[-1px] mb-6">
              TamalData
            </div>
            <h1 className="font-heading text-text-primary text-5xl lg:text-6xl tracking-[-3px] leading-[0.85] mb-6">
              Ghana&apos;s Cheapest Data Bundles
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed font-barlow font-light">
              TamalData is a premium data bundle marketplace built for Ghanaians.
              We work with wholesale network partners and pass
              the savings directly to you — with fast delivery, zero hidden charges, and
              a seamless experience unlike anything else in the market.
            </p>
          </div>
        </section>

        {/* Trust badges */}
        <section className="pb-section-mobile lg:pb-section-desktop">
          <div className="container-content px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="liquid-glass rounded-[1.25rem] p-6 text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-primary/15 flex items-center justify-center group-hover:bg-accent-primary/25 transition-colors">
                  <ShieldCheck className="h-6 w-6 text-accent-primary" strokeWidth={1.5} />
                </div>
                <p className="font-heading text-text-primary text-2xl mb-1">Trusted by Thousands</p>
                <p className="text-xs text-text-secondary font-barlow font-light">30,000+ orders fulfilled across Ghana</p>
              </div>
              <div className="liquid-glass rounded-[1.25rem] p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-orange/15 flex items-center justify-center group-hover:bg-accent-orange/25 transition-colors">
                  <Zap className="h-6 w-6 text-accent-orange" strokeWidth={1.5} />
                </div>
                <p className="font-heading text-text-primary text-2xl mb-1">Fast Delivery</p>
                <p className="text-xs text-text-secondary font-barlow font-light">Typically delivered within 10–30 minutes</p>
              </div>
              <div className="liquid-glass rounded-[1.25rem] p-6 text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors">
                  <Award className="h-6 w-6 text-accent-primary" strokeWidth={1.5} />
                </div>
                <p className="font-heading text-text-primary text-2xl mb-1">30,000+ Orders</p>
                <p className="text-xs text-text-secondary font-barlow font-light">And counting. Trusted by Ghanaians.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="section-padding border-t border-color-border">
          <div className="container-content max-w-2xl mx-auto text-center px-4">
            <h2 className="font-heading text-text-primary text-4xl tracking-[-1px] mb-4">
              Get in Touch
            </h2>
            <p className="text-text-secondary mb-6 font-barlow font-light">
              Need help? Our support team is available on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="https://wa.me/233000000000"
                className="liquid-glass px-5 py-3 rounded-full text-text-primary hover:text-accent-primary transition-all font-barlow"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Support
              </a>
              <a
                href="mailto:hello@tamaldata.com"
                className="liquid-glass px-5 py-3 rounded-full text-text-primary hover:text-accent-primary transition-all font-barlow"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>

        <section id="faq">
          <FaqAccordion />
        </section>
      </main>
      <Footer />
    </>
  );
}
