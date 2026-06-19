import { sendSMS } from "@/lib/arkesel";

const ADMIN_PHONE = process.env.ADMIN_PHONE ?? "";

/**
 * Notify admin when DataMart wallet balance is too low to fulfil an order.
 * Uses SMS (Arkesel) — set ADMIN_PHONE in env.
 */
export async function notifyAdminLowBalance(
  orderRef: string,
  requiredAmount: number
): Promise<void> {
  if (!ADMIN_PHONE) return;

  const message =
    `⚠️ TAMALDATA ALERT: DataMart wallet balance is insufficient.\n` +
    `Order ${orderRef} needs GH₵${requiredAmount.toFixed(2)}.\n` +
    `Please top up the DataMart wallet immediately to fulfil pending orders.`;

  await sendSMS(ADMIN_PHONE, message).catch((err) =>
    console.error("[notify] Failed to send admin low-balance alert:", err)
  );
}
