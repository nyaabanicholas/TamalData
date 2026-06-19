import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy & Order Terms",
  description: "TamalData privacy policy, order guidelines, and refund policy.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container-content max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-heading text-text-primary text-4xl sm:text-5xl leading-tight mb-4">
            Privacy &amp; Order Policy
          </h1>
          <p className="text-text-secondary font-barlow">
            Last updated: June 2025
          </p>
        </div>

        <div className="space-y-10 text-text-secondary font-barlow font-light leading-relaxed">

          {/* ── Order & Refund Policy ── */}
          <section className="liquid-glass rounded-[1.25rem] p-6 md:p-8 space-y-6">
            <h2 className="font-heading text-text-primary text-3xl">
              Order &amp; Refund Policy
            </h2>

            <div className="space-y-2">
              <p className="text-color-warning font-semibold text-base">
                ⚠️ Important Order Guidelines
              </p>
              <p>
                To ensure smooth and successful delivery of your data bundles and airtime, please follow these rules carefully.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">1. Duplicate Orders</h3>
              <p>
                ❌ Do not place multiple orders for the same phone number at the same time.
              </p>
              <p>
                Our system automatically detects duplicate transactions. If two or more orders are submitted for the same number before the first order is delivered, one of the orders may be rejected or discarded.
              </p>
              <p>
                ✅ Always wait for your first order to be fully delivered before placing another order for the same number.
              </p>
              <p className="text-sm">
                Tamal Data will not be responsible for issues resulting from duplicate submissions.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">2. Invalid Orders</h3>
              <p>Please do NOT place orders for:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Turbonet SIMs</li>
                <li>Broadband SIMs</li>
                <li>Agent SIMs</li>
                <li>Invalid or inactive SIMs</li>
                <li>Ported numbers</li>
                <li>Incorrect phone numbers</li>
                <li>Duplicate orders</li>
              </ul>
              <p>
                Customers are responsible for ensuring that all phone numbers entered are correct before making payment.
              </p>
            </div>

            <div className="space-y-3 border-t border-color-border pt-6">
              <h3 className="font-heading text-text-primary text-xl">💰 Refund Policy</h3>
              <p className="font-semibold text-text-primary">
                Tamal Data operates a strict No Refund Policy.
              </p>
              <p>Refunds will not be provided for orders placed on:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Wrong or incorrect phone numbers</li>
                <li>Turbonet, Broadband, or Agent SIMs</li>
                <li>Invalid or inactive SIMs</li>
                <li>Ported numbers</li>
                <li>Duplicate orders</li>
                <li>Numbers with outstanding MTN airtime debt</li>
                <li>Any order submitted in violation of our order guidelines</li>
              </ul>
              <p className="text-sm">
                By placing an order with Tamal Data, you acknowledge and agree to these terms and conditions.
              </p>
              <p className="font-medium text-text-primary">
                Thank you for choosing Tamal Data — Fast, Affordable &amp; Reliable Connectivity.
              </p>
            </div>
          </section>

          {/* ── Privacy Policy ── */}
          <section className="liquid-glass rounded-[1.25rem] p-6 md:p-8 space-y-6">
            <h2 className="font-heading text-text-primary text-3xl">
              Privacy Policy
            </h2>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">Information We Collect</h3>
              <p>
                When you use TamalData, we may collect the following information:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Phone number(s) used for data bundle delivery</li>
                <li>Mobile Money payment details (processed securely via Paystack)</li>
                <li>Account information if you register (name, email, phone)</li>
                <li>Order history and transaction records</li>
                <li>Device and browser information for analytics</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>To process and deliver your data bundle orders</li>
                <li>To send order confirmations and delivery notifications via SMS</li>
                <li>To provide customer support</li>
                <li>To improve our services and detect fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">Data Sharing</h3>
              <p>
                We do not sell your personal data. We share information only with:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Paystack</strong> — for secure payment processing</li>
                <li><strong>DataMart Ghana</strong> — our network API provider for bundle delivery</li>
                <li><strong>Arkesel</strong> — for SMS delivery notifications</li>
              </ul>
              <p>All third-party providers are bound by their own privacy policies.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">Data Security</h3>
              <p>
                We use industry-standard encryption and security practices to protect your data. Payment processing is handled entirely by Paystack — we never store your full card or MoMo PIN details.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">Cookies</h3>
              <p>
                We use essential cookies for session management and performance. We do not use tracking cookies for advertising purposes.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Request access to the data we hold about you</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of promotional communications</li>
              </ul>
              <p>
                To exercise these rights, contact us via WhatsApp or email.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-text-primary text-xl">Contact</h3>
              <p>
                For any privacy concerns or data requests, contact us at{" "}
                <a
                  href="https://whatsapp.com/channel/0029Vb92pF95Ejy2a98gig0Q"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline"
                >
                  our WhatsApp channel
                </a>
                .
              </p>
            </div>
          </section>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 liquid-glass rounded-full px-5 py-2.5 text-sm font-semibold text-text-primary transition-all hover:border-accent-primary"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
