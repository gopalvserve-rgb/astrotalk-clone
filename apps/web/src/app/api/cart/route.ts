import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple cookie-based cart. Phase 5.x will migrate to DB-backed cart.
const CART_COOKIE = "astrotalk_cart";

function readCart(): Array<{ productId: string; qty: number }> {
  const c = cookies().get(CART_COOKIE)?.value;
  try { return c ? JSON.parse(c) : []; } catch { return []; }
}
function writeCart(c: Array<{ productId: string; qty: number }>) {
  cookies().set(CART_COOKIE, JSON.stringify(c), { httpOnly: false, path: "/", maxAge: 60*60*24*30 });
}

export async function GET() {
  return NextResponse.json({ items: readCart() });
}
export async function POST(req: Request) {
  const { productId, qty = 1 } = await req.json();
  const cart = readCart();
  const ex = cart.find(c => c.productId === productId);
  if (ex) ex.qty += qty; else cart.push({ productId, qty });
  writeCart(cart);
  return NextResponse.json({ ok: true, items: cart });
}
export async function DELETE(req: Request) {
  const { productId } = await req.json();
  writeCart(readCart().filter(c => c.productId !== productId));
  return NextResponse.json({ ok: true });
}
