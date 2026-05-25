import { NextResponse } from "next/server";
import { verifyWebhookSignature, getOrder } from "@astrotalk/payments";
import { getMasterDb, getTenantDb } from "@astrotalk/db";

/**
 * Cashfree webhook handler — verifies HMAC, then settles the wallet
 * for the right tenant by looking up the transaction across tenants.
 *
 * In production we should also include `tenantId` in the order metadata
 * so we don't need to scan tenants. Phase 1 keeps it simple.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-webhook-signature") || "";
  const ts  = req.headers.get("x-webhook-timestamp") || "";

  try { verifyWebhookSignature(raw, sig, ts); }
  catch (e) { return NextResponse.json({ error: String(e) }, { status: 400 }); }

  const body = JSON.parse(raw);
  const orderId: string = body?.data?.order?.order_id;
  if (!orderId?.startsWith("wallet_rch_")) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  const txnId = orderId.replace("wallet_rch_", "");

  // Find which tenant DB owns this transaction
  const master = getMasterDb();
  const tenants = await master.tenant.findMany({ where: { status: "ACTIVE" } });
  let matchedTenantId: string | undefined;
  let walletId: string | undefined;
  let amount: any;
  let prismaInst: any;

  for (const t of tenants) {
    const db = getTenantDb(t.id, t.dbConnString);
    const txn = await db.walletTransaction.findUnique({ where: { id: txnId } });
    if (txn) {
      matchedTenantId = t.id; walletId = txn.walletId; amount = txn.amount; prismaInst = db; break;
    }
  }
  if (!matchedTenantId || !walletId || !prismaInst) {
    return NextResponse.json({ error: "Txn not found" }, { status: 404 });
  }

  // Verify with Cashfree directly (double-check, defence-in-depth)
  const order = await getOrder(orderId);
  if (order.order_status !== "PAID") {
    await prismaInst.walletTransaction.update({
      where: { id: txnId }, data: { status: "FAILED" },
    });
    return NextResponse.json({ ok: true, status: order.order_status });
  }

  // Credit wallet atomically
  await prismaInst.$transaction(async (tx: any) => {
    const w = await tx.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } },
    });
    await tx.walletTransaction.update({
      where: { id: txnId },
      data: { status: "SUCCESS", balanceAfter: w.balance, completedAt: new Date() },
    });
  });

  return NextResponse.json({ ok: true });
}
