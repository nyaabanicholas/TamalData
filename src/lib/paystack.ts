import crypto from "crypto";
import type { Network } from "@/types";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = "https://api.paystack.co";

// Paystack Ghana mobile money bank codes
const MOMO_BANK_CODES: Record<Network, string> = {
  MTN: "MTN",
  TELECEL: "VOD",
  AIRTELTIGO: "ATL",
};

// Paystack test mobile money numbers for Ghana
// Official test number for Ghana MoMo: 0551234987 (MTN)
// For other networks, MTN's test number is used as Paystack's test environment
// uses the same number across providers.
// Reference: https://paystack.com/docs/payments/test-payments/
export const PAYSTACK_TEST_NUMBERS: Record<Network, string> = {
  MTN: "0551234987",
  TELECEL: "0241234567",
  AIRTELTIGO: "0261234567",
};

// Check if we're in test mode (development or test API keys)
export function isTestMode(): boolean {
  return !!(process.env.NODE_ENV === "development" || 
         process.env.PAYSTACK_SECRET_KEY?.includes("test") ||
         process.env.PAYSTACK_SECRET_KEY?.includes("sk_test"));
}

function paystackHeaders() {
  return {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  };
}

export interface InitiateChargeParams {
  amount: number; // in GHS (will be converted to pesewas ×100)
  phone: string;
  network: Network;
  reference: string;
  email?: string;
}

export interface ChargeResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: string;
    display_text?: string;
  };
}

export async function initiateCharge(
  params: InitiateChargeParams
): Promise<ChargeResponse> {
  const { amount, phone, network, reference, email } = params;

  const res = await fetch(`${BASE_URL}/charge`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      amount: Math.round(amount * 100), // convert GHS to pesewas
      currency: "GHS",
      mobile_money: {
        phone,
        provider: MOMO_BANK_CODES[network],
      },
      reference,
      email: email ?? `${phone}@tamaldata.com`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack charge error ${res.status}: ${body}`);
  }

  return res.json() as Promise<ChargeResponse>;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at?: string;
  };
}

// Paystack MoMo payout (transfer) types
export interface TransferRecipientParams {
  name: string;
  phone: string;
  network: Network;
}

export interface TransferRecipient {
  status: boolean;
  message: string;
  data: {
    recipient_code: string;
    name: string;
    details: {
      account_number: string;
      account_name: string;
      bank_code: string;
    };
  };
}

export interface CreateTransferParams {
  amount: number; // in GHS
  recipient: string; // recipient code
  reference: string;
  reason: string;
}

export interface TransferResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    transfer_code: string;
    status: string;
    amount: number;
    currency: string;
    recipient: string;
  };
}

export interface TransferStatusResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    paid_at?: string;
    failed_at?: string;
    failure_reason?: string;
  };
}

/**
 * Create a transfer recipient for MoMo payout
 * Note: For Ghana MoMo, we need to use the bank code approach
 */
export async function createTransferRecipient(
  params: TransferRecipientParams
): Promise<TransferRecipient> {
  const { name, phone, network } = params;
  const bankCode = MOMO_BANK_CODES[network];

  const res = await fetch(`${BASE_URL}/transferrecipient`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      type: "mobile_money",
      name,
      account_number: phone,
      bank_code: bankCode,
      currency: "GHS",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack create recipient error ${res.status}: ${body}`);
  }

  return res.json() as Promise<TransferRecipient>;
}

/**
 * Check if a recipient already exists and return their code
 */
export async function getRecipientCode(phone: string, network: Network): Promise<string | null> {
  try {
    const bankCode = MOMO_BANK_CODES[network];
    const res = await fetch(`${BASE_URL}/transferrecipient?account_number=${phone}&bank_code=${bankCode}`, {
      method: "GET",
      headers: paystackHeaders(),
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      const body = await res.text();
      throw new Error(`Paystack get recipient error ${res.status}: ${body}`);
    }

    const data = await res.json();
    if (data.status && data.data && data.data.length > 0) {
      return data.data[0].recipient_code;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Initiate a MoMo payout transfer
 * This sends money FROM your Paystack balance TO the recipient's MoMo
 */
export async function createTransfer(
  params: CreateTransferParams
): Promise<TransferResponse> {
  const { amount, recipient, reference, reason } = params;

  const res = await fetch(`${BASE_URL}/transfer`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      source: "balance", // Use Paystack balance as source
      amount: Math.round(amount * 100), // convert GHS to pesewas
      currency: "GHS",
      recipient,
      reference,
      reason,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack transfer error ${res.status}: ${body}`);
  }

  return res.json() as Promise<TransferResponse>;
}

/**
 * Check the status of a transfer
 */
export async function getTransferStatus(
  reference: string
): Promise<TransferStatusResponse> {
  const res = await fetch(`${BASE_URL}/transfer/verify/${reference}`, {
    method: "GET",
    headers: paystackHeaders(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack transfer status error ${res.status}: ${body}`);
  }

  return res.json() as Promise<TransferStatusResponse>;
}
