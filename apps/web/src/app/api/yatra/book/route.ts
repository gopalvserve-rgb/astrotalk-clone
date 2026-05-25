import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { resolveTenant, tenantDb } from "../../../../lib/tenant";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { yatraId, travellers } = await req.json();

  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const y = await db.yatra.findUnique({ where: { id: yatraId } });
  if (!y || !y.isActive) return NextResponse.json({ error: "Yatra not found" }, { status: 404 });
  if (y.capacity - y.bookedCount < travellers) return NextResponse.json({ error: "Not enough seats" }, { status: 409 });

  const total = Number(y.price) * travellers;
  const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });
  if (!wallet || Number(wallet.balance) < total) return NextResponse.json({ error: "Recharge wallet" }, { status: 402 });

  await db.$transaction(async (tx) => {
    const b = await tx.yatraBooking.create({ data: { yatraId: y.id, userId: user.uid, travellers, amount: total } });
    const w = await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: total as any } } });
    await tx.walletTransaction.create({ data: { walletId: w.id, type: "DEDUCT_YATRA", amount: total as any, balanceAfter: w.balance, status: "SUCCESS", reference: b.id, description: `Yatra: ${y.name}` } });
    await tx.yatra.update({ where: { id: y.id }, data: { bookedCount: { increment: travellers } } });
  });
  return NextResponse.json({ ok: true });
}
