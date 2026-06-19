import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGHS(amount: number): string {
  return `GH₵${amount.toFixed(2)}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
}

export function detectNetworkFromPhone(phone: string): string | null {
  const cleaned = phone.replace(/\s/g, "");
  if (/^(0244|0245|0246|0247|0248|0249|0254|0255|0257|0258|0259|0020|0023|0026|0028|0059|0050|0055|0056|0057|0058|0200|0261|0262|0263|0264|0265|0266|0267|0268|0269)/.test(cleaned)) {
    // MTN: 024x, 025x, 023x (some), 026x (some)
    if (/^(0244|0245|0246|0247|0248|0249|0254|0255|0257|0258|0259)/.test(cleaned)) return "MTN";
    // Telecel: 020x, 050x
    if (/^(0200|0201|0202|0203|0500|0501|0502|0503|0504|0505)/.test(cleaned)) return "TELECEL";
    // AirtelTigo: 026x, 027x, 057x
    if (/^(0260|0261|0262|0263|0264|0265|0270|0271|0272|0573|0574|0575)/.test(cleaned)) return "AIRTELTIGO";
  }
  // Broader fallback patterns
  if (/^024[4-9]|^025[4-9]/.test(cleaned)) return "MTN";
  if (/^020[0-5]|^050[0-9]/.test(cleaned)) return "TELECEL";
  if (/^026[0-9]|^027[0-9]/.test(cleaned)) return "AIRTELTIGO";
  return null;
}

export function isValidGhanaPhone(phone: string): boolean {
  return /^0[2345][0-9]{8}$/.test(phone.replace(/\s/g, ""));
}
