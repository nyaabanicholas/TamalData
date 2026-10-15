// Single source for support contact links.
// Set NEXT_PUBLIC_SUPPORT_WHATSAPP (digits only, e.g. 233241234567) to open a direct chat;
// until then links fall back to the official WhatsApp channel.
const WA_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, "");

export const SUPPORT_WHATSAPP_URL = WA_NUMBER
  ? `https://wa.me/${WA_NUMBER}`
  : "https://whatsapp.com/channel/0029Vb92pF95Ejy2a98gig0Q";

export const SUPPORT_EMAIL = "support@tamaldata.com";
