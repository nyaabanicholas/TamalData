import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="cinematic border-t border-color-border">
      <div className="container-content py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand — 2 cols */}
          <div className="md:col-span-2">
            <div className="mb-5">
              <Image src="/logo.png" alt="TamalData" width={220} height={68} className="h-16 w-auto object-contain" />
            </div>
            <p className="text-text-secondary text-base leading-relaxed font-barlow font-light max-w-xs" style={{ color: "var(--text-secondary)" }}>
              Ghana&apos;s cheapest data bundle marketplace. Fast, reliable delivery on MTN, Telecel, and AirtelTigo.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-5 text-base uppercase tracking-wide font-barlow" style={{ color: "var(--text-primary)" }}>
              Services
            </h4>
            <ul className="space-y-3 text-sm font-barlow font-light" style={{ color: "var(--text-secondary)" }}>
              <li><Link href="/buy" className="hover:text-accent-primary transition-colors">Buy Data</Link></li>
              <li><Link href="/track" className="hover:text-accent-primary transition-colors">Track Order</Link></li>
              <li><Link href="/auth/register?role=reseller" className="hover:text-accent-primary transition-colors">Become a Reseller</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-5 text-base uppercase tracking-wide font-barlow" style={{ color: "var(--text-primary)" }}>
              Info
            </h4>
            <ul className="space-y-3 text-sm font-barlow font-light" style={{ color: "var(--text-secondary)" }}>
              <li><Link href="/about" className="hover:text-accent-primary transition-colors">About Us</Link></li>
              <li><Link href="/about#faq" className="hover:text-accent-primary transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-accent-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5 text-base uppercase tracking-wide font-barlow" style={{ color: "var(--text-primary)" }}>
              Contact
            </h4>
            <ul className="space-y-4 text-sm font-barlow font-light" style={{ color: "var(--text-secondary)" }}>
              <li>
                <a href="mailto:support@tamaldata.com" className="hover:text-accent-primary transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-accent-primary" />
                  support@tamaldata.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/233000000000" className="hover:text-accent-primary transition-colors flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 shrink-0 text-accent-primary" />
                  WhatsApp Support
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-accent-primary" />
                Accra, Ghana
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-color-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-barlow" style={{ color: "var(--text-secondary)" }}>
          <p>&copy; 2026 TamalData. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-accent-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent-primary transition-colors">Terms</Link>
            <Link href="/about#faq" className="hover:text-accent-primary transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
