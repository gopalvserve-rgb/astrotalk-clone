/**
 * Cashfree Payments — wrapper for PG (orders / sessions / verify / refund)
 * and Payouts (for astrologer settlements in Phase 4).
 *
 * Docs: https://docs.cashfree.com
 *
 * Env required:
 *   CASHFREE_ENV         = TEST | PROD
 *   CASHFREE_APP_ID      = …
 *   CASHFREE_SECRET_KEY  = …
 *   CASHFREE_WEBHOOK_SECRET = …
 */

import crypto from "node:crypto";

const PG_BASE = () =>
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const API_VERSION = "2023-08-01";

function authHeaders() {
  const id = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!id || !secret) throw new Error("Cashfree credentials missing");
  return {
    "x-client-id": id,
    "x-client-secret": secret,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };
}

// ─── Create order (wallet recharge) ───────────────────────────────────

export interface CreateOrderInput {
  orderId: string;                  // unique — e.g. `wallet_rch_<txnId>`
  amount: number;                   // INR
  currency?: string;                // default INR
  customer: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
  returnUrl: string;
  notifyUrl?: string;               // webhook
  note?: string;
}

export interface CreateOrderResult {
  cfOrderId: string;
  paymentSessionId: string;         // pass to Cashfree JS SDK on the client
  orderStatus: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const body = {
    order_id: input.orderId,
    order_amount: input.amount,
    order_currency: input.currency ?? "INR",
    customer_details: {
      customer_id: input.customer.id,
      customer_name: input.customer.name,
      customer_email: input.customer.email ?? `${input.customer.id}@noemail.astrotalk`,
      customer_phone: input.customer.phone,
    },
    order_meta: {
      return_url: input.returnUrl,
      notify_url: input.notifyUrl,
    },
    order_note: input.note,
  };

  const res = await fetch(`${PG_BASE()}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Cashfree createOrder ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as any;
  return {
    cfOrderId: data.cf_order_id,
    paymentSessionId: data.payment_session_id,
    orderStatus: data.order_status,
  };
}

// ─── Fetch order status (for server-side verify) ──────────────────────

export async function getOrder(orderId: string) {
  const res = await fetch(`${PG_BASE()}/orders/${orderId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Cashfree getOrder ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ order_status: "PAID" | "ACTIVE" | "EXPIRED"; order_amount: number;[k: string]: any }>;
}

// ─── Refund ───────────────────────────────────────────────────────────

export async function createRefund(orderId: string, opts: {
  refundId: string; amount: number; note?: string;
}) {
  const res = await fetch(`${PG_BASE()}/orders/${orderId}/refunds`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      refund_id: opts.refundId,
      refund_amount: opts.amount,
      refund_note: opts.note,
    }),
  });
  if (!res.ok) throw new Error(`Cashfree refund ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Webhook signature verify ─────────────────────────────────────────

export function verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret) throw new Error("CASHFREE_WEBHOOK_SECRET missing");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
