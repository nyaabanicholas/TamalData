import type { Network } from "@/types";
import { createHash } from "crypto";
import { getBundlesByNetwork } from "@/data/bundles";

const BASE_URL = process.env.DATAMART_BASE_URL ?? "https://api.datamartgh.shop";
const API_KEY = process.env.DATAMART_API_KEY!;

// Reseller routes live under /api/developer/ (NOT /api/). The /api/* paths in
// the public docs are 404 for reseller keys — the working namespace is developer.
const API_PREFIX = "/api/developer";

// Configuration for API resilience
const DEFAULT_TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [2000, 5000, 10000];

// DataMart network codes
const NETWORK_CODE: Record<Network, string> = {
  MTN: "YELLO",
  TELECEL: "TELECEL",
  AIRTELTIGO: "AT_PREMIUM",
};

/** Parse a bundle size string like "5GB" or "500MB" into the numeric GB string the API expects */
export function parseCapacity(size: string): string {
  const upper = size.toUpperCase().replace(/\s/g, "");
  if (upper.endsWith("GB")) {
    const num = parseFloat(upper);
    return isNaN(num) ? size : String(num);
  }
  if (upper.endsWith("MB")) {
    const num = parseFloat(upper) / 1024;
    return isNaN(num) ? size : num.toFixed(2);
  }
  return size;
}

/** Generate a deterministic idempotency key from a reference */
function idempotencyKey(ref: string): string {
  return createHash("sha256").update(ref).digest("hex").slice(0, 32);
}

function datamartHeaders(ref?: string) {
  const headers: Record<string, string> = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  };
  if (ref) headers["X-Idempotency-Key"] = idempotencyKey(ref);
  return headers;
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number },
  timeout: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Export headers function for use in other modules
export { datamartHeaders };

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Generic API response envelope ──────────────────────────────────────

interface DatamartApiEnvelope<T> {
  status: "success" | "error";
  message?: string;
  data: T;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetInSeconds: number;
  };
}

/**
 * Generic fetcher — unwraps the { status, data } envelope.
 * Throws on error status or non-2xx.
 */
async function datamartFetch<T>(
  path: string,
  options?: RequestInit & { ref?: string; timeout?: number; retries?: number }
): Promise<T> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options?.retries ?? MAX_RETRIES;

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
        ...options,
        timeout,
      }, timeout);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const error = new Error(
          `DataMart API error ${res.status}: ${body || "Unknown error"}`
        );
        (error as { status?: number; responseBody?: string }).status = res.status;
        (error as { status?: number; responseBody?: string }).responseBody = body;
        throw error;
      }

      const raw = await res.json() as DatamartApiEnvelope<T>;

      if (raw.status === "error") {
        throw new Error(raw.message ?? "DataMart API returned error");
      }

      return raw.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on 4xx client errors except 429 (rate limit)
      const status = (error as { status?: number }).status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw lastError;
      }

      if (attempt >= maxRetries) throw lastError;

      const delay = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[MAX_RETRIES - 1];
      console.warn(
        `[datamart] Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${lastError.message}`
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

// ─── Types matching DataMart API responses ──────────────────────────────

export interface DatamartDataPackage {
  capacity: number;
  mb: number;
  network: string;
  price: number;
}

export interface DatamartPackagesResponse {
  [network: string]: DatamartDataPackage[];
}

export interface DatamartPurchaseResponse {
  purchaseId: string;
  orderReference: string;
  transactionReference: string;
  network: string;
  capacity: number;
  price: number;
  balanceBefore: number;
  balanceAfter: number;
  orderStatus: "completed" | "pending" | "processing" | "failed";
  processingMethod: string;
}

export interface DatamartBalanceData {
  balance: number;
  currency: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
}

export interface DatamartOrderStatusData {
  orderId: string;
  reference: string;
  phoneNumber: string;
  network: string;
  capacity: number;
  price: number;
  orderStatus: "pending" | "waiting" | "processing" | "completed" | "failed" | "refunded";
  processingMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatamartBulkOrderItem {
  phoneNumber: string;
  network: string;
  capacity: string;
  ref?: string;
}

export interface DatamartBulkPurchaseResult {
  index: number;
  ref?: string;
  phoneNumber: string;
  network: string;
  capacity: string;
  price: number;
  status: string;
  purchaseId: string;
  orderReference: string;
  transactionReference: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface DatamartBulkPurchaseResponse {
  summary: {
    total: number;
    successful: number;
    failed: number;
    invalid: number;
    totalCharged: number;
    remainingBalance: number;
  };
  results: DatamartBulkPurchaseResult[];
  validationErrors: Array<{ index: number; message: string }>;
}

// ─── Conversion helpers ─────────────────────────────────────────────────

export function toDatamartNetwork(network: Network): string {
  return NETWORK_CODE[network] ?? network;
}

const NETWORK_FROM_CODE: Record<string, Network> = Object.entries(
  NETWORK_CODE,
).reduce(
  (acc, [net, code]) => {
    acc[code] = net as Network;
    return acc;
  },
  {} as Record<string, Network>,
);

export function fromDatamartNetwork(code: string): Network | undefined {
  return NETWORK_FROM_CODE[code.toUpperCase()];
}

// ─── API Methods ────────────────────────────────────────────────────────

/**
 * GET /api/data-packages?network=YELLO
 * Fetch available data packages from DataMart
 */
export async function fetchDataPackages(network?: string): Promise<DatamartPackagesResponse> {
  const query = network ? `?network=${network}` : "";
  return datamartFetch<DatamartPackagesResponse>(`${API_PREFIX}/data-packages${query}`);
}

/**
 * Fetch available data bundles (local fallback, uses DataMart API when available)
 * Kept for backward compatibility with existing code.
 */
export async function fetchBundles(network?: Network): Promise<DatamartDataPackage[]> {
  try {
    const dmNetwork = network ? toDatamartNetwork(network) : undefined;
    const packages = await fetchDataPackages(dmNetwork);
    if (network && packages[dmNetwork!]) {
      return packages[dmNetwork!];
    }
    // Flatten all networks
    const all: DatamartDataPackage[] = [];
    for (const key of Object.keys(packages)) {
      if (key !== "pricingTier" && Array.isArray(packages[key])) {
        all.push(...packages[key]);
      }
    }
    if (all.length > 0) return all;
  } catch {
    // Fall through to local bundles below
  }

  // Fallback to local bundle definitions
  const local = getBundlesByNetwork(network);
  return local.map((b) => ({
    capacity: b.gb,
    mb: b.mb,
    network: b.dmNetwork,
    price: b.costPrice,
  }));
}

/**
 * POST /api/purchase
 * Place a single data order
 */
export async function placeOrder(
  payload: {
    phoneNumber: string;
    network: string;
    capacity: string; // GB as string e.g. "5"
    gateway: "wallet";
  } & { reference: string }
): Promise<DatamartPurchaseResponse> {
  return datamartFetch<DatamartPurchaseResponse>(`${API_PREFIX}/purchase`, {
    method: "POST",
    body: JSON.stringify({
      phoneNumber: payload.phoneNumber,
      network: payload.network,
      capacity: payload.capacity,
      gateway: payload.gateway,
    }),
    ref: payload.reference,
  });
}

/**
 * POST /api/bulk-purchase
 * Place multiple orders in a single request (up to 50)
 */
export async function bulkPurchase(
  payload: {
    orders: DatamartBulkOrderItem[];
  } & { reference: string }
): Promise<DatamartBulkPurchaseResponse> {
  return datamartFetch<DatamartBulkPurchaseResponse>(`${API_PREFIX}/bulk-purchase`, {
    method: "POST",
    body: JSON.stringify({
      orders: payload.orders,
    }),
    ref: payload.reference,
  });
}

/**
 * GET /api/balance
 * Get wallet balance
 */
export async function getBalance(): Promise<DatamartBalanceData> {
  return datamartFetch<DatamartBalanceData>(`${API_PREFIX}/balance`);
}

/**
 * GET /api/order-status/:reference
 * Check order delivery status
 */
export async function getOrderStatus(
  ref: string
): Promise<DatamartOrderStatusData> {
  return datamartFetch<DatamartOrderStatusData>(`${API_PREFIX}/order-status/${encodeURIComponent(ref)}`);
}

/**
 * Check if DataMart wallet has sufficient balance for an order
 */
export async function checkDataMartBalance(amount: number): Promise<boolean> {
  try {
    const balanceData = await getBalance();
    return Number(balanceData.balance) >= amount;
  } catch (error) {
    console.error("[datamart] Failed to check balance:", error);
    // Fail open — assume enough balance so orders aren't blocked
    return true;
  }
}

// Export configuration constants
export { DEFAULT_TIMEOUT_MS, MAX_RETRIES, RETRY_DELAYS_MS };
