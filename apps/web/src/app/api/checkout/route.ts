import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "../../../lib/auth";
import { resolveTenant, tenantDb } from "../../../lib/tenant";
import { createOrder } from "@astrotalk/payments";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to checkout" }, { status: 401 });
  const { method } = await req.json();

  const c = cookies().get("astrotalk_cart")?.value;
  const items: Array<{ productId: string; qty: number }> = c ? JSON.parse(c) : [];
  if (!items.length) return NextResponse.json({ error: "Cart empty" }, { status: 400 });

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);
  const products = await db.product.findMany({ where: { id: { in: items.map(i => i.productId) } } });
  const map = new Map(products.map(p => [p.id, p]));

  let total = 0;
  for (const it of items) {
    const p = map.get(it.productId);
    if (!p) continue;
    if (p.stock < it.qty) return NextResponse.json({ error: `${p.name} out of stock` }, { status: 400 });
    total += Number(p.price) * it.qty;
  }

  const order = await db.order.create({
    data: {
      userId: user.uid, status: "PENDING", total,
      paymentMethod: method,
      items: { create: items.map(i => ({
        productId: i.productId, qty: i.qty, price: map.get(i.productId)!.price,
      })) },
    },
  });

  if (method === "wallet") {
    const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });
    if (!wallet || Number(wallet.balance) < total) return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 402 });
    await db.$transaction(async (tx) => {
      const w = await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: total as any } } });
      await tx.walletTransaction.create({ data: { walletId: w.id, type: "DEDUCT_ORDER", amount: total as any, balanceAfter: w.balance, status: "SUCCESS", reference: order.id, description: `Order #${order.id}` } });
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID", paymentRef: "wallet" } });
      for (const it of items) await tx.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } });
    });
    cookies().delete("astrotalk_cart");
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  // Cashfree
  const origin = new URL(req.url).origin;
  const cfUser = await db.user.findUnique({ where: { id: user.uid } });
  const cf = await createOrder({
    orderId: `order_${order.id}`, amount: total,
    customer: { id: user.uid, name: cfUser?.name || "User", phone: cfUser?.phone || "9999999999", email: cfUser?.email || undefined },
    returnUrl: `${origin}/orders/${order.id}`,
    notifyUrl: `${origin}/api/checkout/webhook`,
    note: `Order ${order.id}`,
  });
  await db.order.update({ where: { id: order.id }, data: { paymentRef: cf.cfOrderId } });
  return NextResponse.json({ paymentSessionId: cf.paymentSessionId, env: process.env.CASHFREE_ENV ?? "TEST", orderId: order.id });
}
