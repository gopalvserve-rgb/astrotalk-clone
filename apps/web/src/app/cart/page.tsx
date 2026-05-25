import { cookies } from "next/headers";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { resolveTenant, tenantDb } from "@/lib/tenant";
import CheckoutButton from "./CheckoutButton";

export default async function CartPage() {
  const c = cookies().get("astrotalk_cart")?.value;
  const items: Array<{ productId: string; qty: number }> = c ? JSON.parse(c) : [];
  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);
  const products = items.length > 0
    ? await db.product.findMany({ where: { id: { in: items.map(i => i.productId) } } })
    : [];
  const map = new Map(products.map(p => [p.id, p]));
  const total = items.reduce((s, i) => s + Number(map.get(i.productId)?.price ?? 0) * i.qty, 0);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Your Cart</h1>
        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">
            Your cart is empty. <a href="/shop" className="underline text-white">Browse shop →</a>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5 text-white/60 text-left text-sm">
                  <tr><th className="p-3">Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {items.map(i => {
                    const p = map.get(i.productId); if (!p) return null;
                    return (
                      <tr key={i.productId} className="border-t border-white/5 text-white">
                        <td className="p-3">{p.name}</td>
                        <td>{i.qty}</td>
                        <td>₹ {p.price.toString()}</td>
                        <td>₹ {(Number(p.price) * i.qty).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div className="text-2xl font-bold text-white">Total: ₹ {total.toFixed(2)}</div>
              <CheckoutButton />
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
