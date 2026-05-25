/**
 * Cashfree Payouts — for astrologer settlements (T+2).
 * Docs: https://docs.cashfree.com/docs/payouts
 */

const BASE = () =>
  process.env.CASHFREE_ENV === "PROD"
    ? "https://payout-api.cashfree.com/payout/v1"
    : "https://payout-gamma.cashfree.com/payout/v1";

let cachedToken: { token: string; exp: number } | null = null;

async function authenticate(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now()) return cachedToken.token;
  const r = await fetch(`${BASE()}/authorize`, {
    method: "POST",
    headers: {
      "X-Client-Id": process.env.CASHFREE_PAYOUT_CLIENT_ID || "",
      "X-Client-Secret": process.env.CASHFREE_PAYOUT_CLIENT_SECRET || "",
    },
  });
  if (!r.ok) throw new Error("Cashfree Payouts auth failed");
  const d = await r.json() as any;
  cachedToken = { token: d.data.token, exp: Date.now() + (d.data.expiry * 1000) - 30000 };
  return cachedToken.token;
}

export async function addBeneficiary(b: {
  beneId: string; name: string; email: string; phone: string;
  bankAccount: string; ifsc: string; address1: string; city: string; state: string; pincode: string;
}): Promise<void> {
  const token = await authenticate();
  const r = await fetch(`${BASE()}/addBeneficiary`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(b),
  });
  if (!r.ok) throw new Error(`addBeneficiary ${r.status}: ${await r.text()}`);
}

export async function requestTransfer(t: {
  beneId: string; amount: number; transferId: string; remarks?: string;
}): Promise<{ status: string; transferId: string }> {
  const token = await authenticate();
  const r = await fetch(`${BASE()}/requestTransfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(t),
  });
  if (!r.ok) throw new Error(`requestTransfer ${r.status}: ${await r.text()}`);
  return (await r.json()).data;
}
