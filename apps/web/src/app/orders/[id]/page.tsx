import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { resolveTenant, tenantDb } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser(); if (!user) redirect("/signin");
  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.userId !== user.uid) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="text-6xl text-center">{order.status === "PAID" ? "🎉" : "⏳"}</div>
        <h1 className="font-display text-3xl font-bold text-white text-center mt-3">Order #{order.id.slice(0,8)}</h1>
        <div className="text-center text-white/60 mt-1">Status: {order.status}</div>

        <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60 text-left">
              <tr><th className="p-3">Item</th><th>Qty</th><th>Price</th></tr>
            </thead>
            <tbody>
              {order.items.map(i => (
                <tr key={i.id} className="border-t border-white/5 text-white">
                  <td className="p-3">{i.product.name}</td><td>{i.qty}</td><td>₹ {i.price.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right text-white text-xl font-bold">Total: ₹ {order.total.toString()}</div>
      </main>
      <Footer />
    </>
  );
}
