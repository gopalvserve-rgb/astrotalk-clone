import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { resolveTenant, tenantDb } from "../../../../lib/tenant";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { causeId, amount, message } = await req.json();

  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });
  if (!wallet || Number(wallet.balance) < Number(amount)) {
    return NextResponse.json({ error: "Recharge wallet to donate" }, { status: 402 });
  }

  await db.$transaction(async (tx) => {
    const w = await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amount as any } } });
    await tx.walletTransaction.create({ data: { walletId: w.id, type: "DEDUCT_ORDER", amount: amount as any, balanceAfter: w.balance, status: "SUCCESS", reference: causeId, description: `Sewa donation` } });
    await tx.sewaDonation.create({ data: { causeId, userId: user.uid, amount, message } });
    await tx.sewaCause.update({ where: { id: causeId }, data: { raisedAmount: { increment: amount as any } } });
  });

  return NextResponse.json({ ok: true });
}
