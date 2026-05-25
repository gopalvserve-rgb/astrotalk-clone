import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { resolveTenant, tenantDb } from "../../../../lib/tenant";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { templateId, scheduledAt, notes } = await req.json();

  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const t = await db.poojaTemplate.findUnique({ where: { id: templateId } });
  if (!t || !t.isActive) return NextResponse.json({ error: "Pooja not found" }, { status: 404 });

  const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });
  if (!wallet || Number(wallet.balance) < Number(t.basePrice)) {
    return NextResponse.json({ error: "Recharge wallet to book" }, { status: 402 });
  }

  const booking = await db.$transaction(async (tx) => {
    const b = await tx.poojaBooking.create({
      data: {
        userId: user.uid, templateId: t.id,
        scheduledAt: new Date(scheduledAt), duration: t.duration,
        amount: t.basePrice, notes, status: "confirmed", paymentMethod: "wallet",
      },
    });
    const w = await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: t.basePrice as any } } });
    await tx.walletTransaction.create({
      data: { walletId: w.id, type: "DEDUCT_POOJA", amount: t.basePrice as any,
              balanceAfter: w.balance, status: "SUCCESS", reference: b.id, description: `Pooja: ${t.name}` },
    });
    return b;
  });
  return NextResponse.json({ ok: true, bookingId: booking.id });
}
