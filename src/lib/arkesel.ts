const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY!;
const SENDER_ID = process.env.ARKESEL_SENDER_ID ?? "TamalData";
const BASE_URL = "https://sms.arkesel.com/api/v2/sms/send";

export async function sendSMS(to: string, message: string): Promise<void> {
  if (!ARKESEL_API_KEY) {
    console.warn("[Arkesel] SMS skipped — ARKESEL_API_KEY not set");
    return;
  }

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "api-key": ARKESEL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: SENDER_ID,
        message,
        recipients: [to],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Arkesel] SMS failed ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error("[Arkesel] SMS error:", err);
  }
}

export const SMS_TEMPLATES = {
  orderPlaced: (ref: string, size: string, network: string) =>
    `Your TamalData order #${ref} for ${size} ${network} data has been placed. You'll receive it within 2 minutes.`,

  orderDelivered: (size: string, network: string) =>
    `Your ${size} ${network} data bundle has been successfully delivered! Enjoy browsing. - TamalData`,

  orderFailed: (ref: string) =>
    `Your TamalData order #${ref} could not be completed. You have not been charged. Contact us for support.`,
};
