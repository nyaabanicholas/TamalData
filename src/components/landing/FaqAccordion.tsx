"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How long does data delivery take?",
    a: "Delivery typically takes 10–30 minutes. In rare cases it may take up to 1 hour. You can track your order in real time on the Track Order page.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. You can buy data as a guest in under 3 steps. Creating an account gives you a wallet, order history, and referral earnings.",
  },
  {
    q: "Is the data non-expiry?",
    a: "Some bundles are non-expiry. Each bundle card clearly shows the validity period. Non-expiry bundles never expire as long as your line is active.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "We accept MTN Mobile Money, Telecel Cash, and AirtelTigo Money. Registered users can also pay from their TamalData wallet.",
  },
  {
    q: "What happens if my data doesn't arrive?",
    a: "If your data isn't delivered within 15 minutes, you receive a full refund automatically. You can also track your order in real time on the Track Order page.",
  },
  {
    q: "How do I become a reseller?",
    a: "Click 'Become a Reseller' and register for a reseller account. After approval (usually same day), you get wholesale pricing and your own storefront link.",
  },
  {
    q: "Are TamalData prices really the cheapest?",
    a: "Yes — we source directly from DataMart Ghana's reseller API and apply a transparent, low markup. Our prices beat market rates on all major networks.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section-padding relative overflow-hidden bg-orbs">
      <div className="container-content max-w-3xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-text-primary text-2xl sm:text-3xl md:text-5xl leading-tight mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className="liquid-glass rounded-[1.25rem] overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-5 text-left text-text-primary font-medium font-barlow hover:text-text-secondary transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-text-secondary text-sm leading-relaxed font-barlow font-light">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
