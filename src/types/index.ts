export type Network = "MTN" | "TELECEL" | "AIRTELTIGO";
export type OrderStatus =
  | "PENDING"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "DELIVERED"
  | "FAILED"
  | "REFUNDED";
export type PaymentMethod =
  | "MTN_MOMO"
  | "TELECEL_CASH"
  | "AIRTELTIGO_MONEY"
  | "WALLET";
export type Role = "USER" | "RESELLER" | "ADMIN";
export type ResellerStatus = "PENDING_APPROVAL" | "APPROVED" | "SUSPENDED";
export type TransactionType = "CREDIT" | "DEBIT";

export interface DataBundle {
  id: string;
  network: Network;
  size: string;
  validity: string;
  price: number;
  type: string;
  available: boolean;
}

export interface OrderPayload {
  network: Network;
  phone: string;
  bundleId: string;
  bundleSize: string;
  bundleValidity: string;
  sellPrice: number;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  userId?: string;
  agentId?: string;
  reference: string;
}

export interface OrderRecord {
  id: string;
  reference: string;
  network: Network;
  bundleSize: string;
  bundleValidity: string;
  recipientPhone: string;
  sellPrice: number;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  status: OrderStatus;
  datamartRef?: string;
  failureReason?: string;
  deliveredAt?: string;
  updatedAt: string;
  createdAt: string;
}

export interface NetworkStatus {
  network: Network;
  status: "OPERATIONAL" | "DEGRADED" | "OFFLINE";
  lastChecked: string;
}

export interface BuyState {
  step: number;
  network: Network | null;
  bundle: DataBundle | null;
  phone: string;
  paymentMethod: PaymentMethod | null;
  momoPhone: string;
  orderRef: string | null;
}
