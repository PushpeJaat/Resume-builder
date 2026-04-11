import { randomUUID } from "crypto";
import { PaymentStatus } from "@prisma/client";

export type CashfreeMode = "sandbox" | "production";

const DEFAULT_CASHFREE_API_VERSION = "2023-08-01";
const DEFAULT_CURRENCY = "INR";
const DEFAULT_DOWNLOAD_AMOUNT = 49;

function parsePositiveNumber(input: string | undefined, fallback: number): number {
  if (!input) {
    return fallback;
  }
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export function getCashfreeMode(): CashfreeMode {
  return process.env.CASHFREE_ENV?.toLowerCase() === "production" ? "production" : "sandbox";
}

export function getCashfreeBaseUrl(mode: CashfreeMode): string {
  return mode === "production" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
}

export function getCashfreeConfig() {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();

  if (!appId || !secretKey) {
    return null;
  }

  const mode = getCashfreeMode();
  const apiVersion = process.env.CASHFREE_API_VERSION?.trim() || DEFAULT_CASHFREE_API_VERSION;
  const currency = process.env.CASHFREE_CURRENCY?.trim() || DEFAULT_CURRENCY;
  const orderAmount = parsePositiveNumber(process.env.CASHFREE_DOWNLOAD_AMOUNT, DEFAULT_DOWNLOAD_AMOUNT);

  return {
    appId,
    secretKey,
    mode,
    apiVersion,
    currency,
    orderAmount,
    amountInPaise: Math.round(orderAmount * 100),
  };
}

export function createCashfreeOrderId(resumeId: string): string {
  const tail = resumeId.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || "resume";
  return `cvp_${tail}_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

export function mapCashfreeOrderStatus(orderStatus: string | null | undefined): PaymentStatus {
  const status = orderStatus?.toUpperCase();

  if (status === "PAID" || status === "SUCCESS") {
    return PaymentStatus.PAID;
  }

  if (status === "FAILED" || status === "FAILURE") {
    return PaymentStatus.FAILED;
  }

  if (status === "CANCELLED" || status === "TERMINATED") {
    return PaymentStatus.CANCELLED;
  }

  if (status === "EXPIRED") {
    return PaymentStatus.EXPIRED;
  }

  return PaymentStatus.CREATED;
}

export function getCashfreeErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const maybePayload = payload as {
    message?: unknown;
    error?: unknown;
    type?: unknown;
  };

  if (typeof maybePayload.message === "string" && maybePayload.message.trim().length > 0) {
    return maybePayload.message;
  }

  if (typeof maybePayload.error === "string" && maybePayload.error.trim().length > 0) {
    return maybePayload.error;
  }

  if (typeof maybePayload.type === "string" && maybePayload.type.trim().length > 0) {
    return maybePayload.type;
  }

  return fallback;
}

export function getCashfreeOrderStatus(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybePayload = payload as {
    order_status?: unknown;
    orderStatus?: unknown;
  };

  if (typeof maybePayload.order_status === "string") {
    return maybePayload.order_status;
  }

  if (typeof maybePayload.orderStatus === "string") {
    return maybePayload.orderStatus;
  }

  return null;
}
