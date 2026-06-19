import Link from "next/link";

export function Footer() {
  return (
    <footer className="cinematic border-t border-color-border">
      <div className="container-content py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-heading text-text-primary text-3xl tracking-[-1px] mb-3">
              TamalData
            </div>
            <p className="text-text-secondary text-sm leading-relaxed font-barlow font-light">
              Ghana&apos;s cheapest data bundle marketplace. Powered by DataMart Ghana.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wide font-barlow">
              Services
            </h4>
            <ul className="space-y-2 text-text-secondary text-sm font-barlow font-light">
              <li><Link href="/buy" className="hover:text-text-primary transition-colors">Buy Data</Link></li>
              <li><Link href="/track" className="hover:text-text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/auth/register?role=reseller" className="hover:text-text-primary transition-colors">Become a Reseller</Link></li>
              <li><Link href="/status" className="hover:text-text-primary transition-colors">Network Status</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wide font-barlow">
              Info
            </h4>
            <ul className="space-y-2 text-text-secondary text-sm font-barlow font-light">
              <li><Link href="/about" className="hover:text-text-primary transition-colors">About Us</Link></li>
              <li><Link href="/about#faq" className="hover:text-text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wide font-barlow">
              Contact
            </h4>
            <ul className="space-y-2 text-text-secondary text-sm font-barlow font-light">
              <li>
                <a
                  href="https://wa.me/233000000000"
                  className="hover:text-text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/tamaldata"
                  className="hover:text-text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/tamaldata"
                  className="hover:text-text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  X / Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-color-border flex flex-col sm:flex-row items-center justify-between gap-4 text-text-muted text-xs font-barlow">
          <p>&copy; 2026 TamalData. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
