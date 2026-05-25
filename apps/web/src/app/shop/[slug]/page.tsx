import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { notFound } from "next/navigation";
import { resolveTenant, tenantDb } from "../../../lib/tenant";
import AddToCart from "./AddToCart";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);
  const p = await db.product.findUnique({ where: { slug: params.slug } });
  if (!p || !p.isActive) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 grid md:grid-cols-2 gap-8">
        <div>
          {p.images.length > 0 ? <img src={p.images[0]} alt={p.name} className="w-full rounded-2xl" /> : <div className="aspect-square bg-white/5 rounded-2xl" />}
          {p.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {p.images.slice(1, 5).map((src, i) => <img key={i} src={src} alt="" className="rounded-lg" />)}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase text-white/50">{p.category}</div>
          <h1 className="font-display text-3xl font-bold text-white mt-1">{p.name}</h1>
          <div className="flex items-baseline gap-3 mt-3">
            <div className="text-[var(--color-primary)] text-3xl font-bold">₹ {p.price.toString()}</div>
            {p.compareAt && <div className="text-white/50 line-through">₹ {p.compareAt.toString()}</div>}
          </div>
          <p className="mt-4 text-white/80 whitespace-pre-wrap">{p.description}</p>
          <AddToCart productId={p.id} />
          <div className="mt-6 text-white/60 text-sm">
            {p.stock > 0 ? `In stock (${p.stock})` : "Out of stock"}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
