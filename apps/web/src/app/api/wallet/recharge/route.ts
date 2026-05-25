import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "../../../../lib/auth";
import { resolveTenant, tenantDb, isModuleEnabled } from "../../../../lib/tenant";
import { createOrder } from "@astrotalk/payments";

const Body = z.object({ amount: z.number().positive().max(100000) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "wallet")) {
    return NextResponse.json({ error: "Wallet module disabled" }, { status: 403 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const db = await tenantDb(tenant);
  const dbUser = await db.user.findUnique({ where: { id: user.uid } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const wallet = await db.wallet.upsert({
    where: { userId: user.uid }, update: {},
    create: { userId: user.uid, balance: 0 },
  });

  // Create wallet transaction in PENDING
  const txn = await db.walletTransaction.create({
    data: {
      walletId: wallet.id, type: "RECHARGE",
      amount: parsed.data.amount, balanceAfter: wallet.balance,
      status: "PENDING", gateway: "cashfree",
      description: `Wallet recharge ₹${parsed.data.amount}`,
    },
  });

  // Initiate Cashfree order
  const origin = new URL(req.url).origin;
  const cf = await createOrder({
    orderId: `wallet_rch_${txn.id}`,
    amount: parsed.data.amount,
    customer: {
      id: dbUser.id, name: dbUser.name || "User",
      phone: dbUser.phone || "9999999999", email: dbUser.email || undefined,
    },
    returnUrl: `${origin}/wallet/return?txn=${txn.id}`,
    notifyUrl: `${origin}/api/wallet/cashfree-webhook`,
    note: "Wallet recharge",
  });

  await db.walletTransaction.update({
    where: { id: txn.id },
    data: { reference: cf.cfOrderId, gatewayTxId: cf.cfOrderId },
  });

  return NextResponse.json({
    paymentSessionId: cf.paymentSessionId,
    env: process.env.CASHFREE_ENV ?? "TEST",
    txnId: txn.id,
  });
}
