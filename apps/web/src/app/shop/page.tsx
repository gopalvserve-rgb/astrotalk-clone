import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ShopPage() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "live_shop")) notFound();
  const db = await tenantDb(tenant);
  const products = await db.product.findMany({ where: { isActive: true }, take: 24, orderBy: { isFeatured: "desc" } });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Astro Shop</h1>
        <p className="text-white/60 mt-1">Gemstones, Rudraksha, Yantras, Vastu items & more.</p>

        {products.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white/5 border border-white/10 p-10 text-white/60 text-center">
            No products yet — admin can upload products from the admin panel.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <a key={p.id} href={`/shop/${p.slug}`} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-[var(--color-primary)]">
                {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover" />}
                <div className="p-3">
                  <div className="text-white text-sm">{p.name}</div>
                  <div className="text-[var(--color-primary)] font-bold mt-1">₹ {p.price.toString()}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
