import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@tamaldata.com";

function createTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendAdminNotification(subject: string, html: string): Promise<void> {
  if (!ADMIN_EMAIL) {
    console.warn("[Email] ADMIN_EMAIL not set — skipping notification");
    return;
  }

  const transport = createTransport();
  if (!transport) {
    console.warn("[Email] SMTP not configured — skipping notification. Set SMTP_HOST, SMTP_USER, SMTP_PASS");
    return;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[TamalData] ${subject}`,
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send notification:", err);
  }
}

export function orderNotificationHtml(order: {
  reference: string;
  network: string;
  bundleSize: string;
  bundleValidity: string;
  recipientPhone: string;
  sellPrice: number;
  paymentMethod: string;
  status: string;
  userName?: string | null;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1200;">New Order — ${order.reference}</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Network</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.network}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Bundle</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.bundleSize} (${order.bundleValidity})</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Recipient</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.recipientPhone}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Amount</td><td style="padding: 8px; border-bottom: 1px solid #eee;">GH₵${order.sellPrice.toFixed(2)}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Payment</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.paymentMethod}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Status</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.status}</td></tr>
        ${order.userName ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">User</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.userName}</td></tr>` : ""}
      </table>
      <p style="color: #666; font-size: 12px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamaldata.com"}/admin/fulfillment" style="color: #2563eb;">View in admin dashboard</a>
      </p>
    </div>
  `;
}
