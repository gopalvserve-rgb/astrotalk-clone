import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "../../lib/tenant";
import { notFound } from "next/navigation";


export const dynamic = "force-dynamic";
export default async function PoojaPage() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "book_pooja")) notFound();
  const db = await tenantDb(tenant);
  const templates = await db.poojaTemplate.findMany({ where: { isActive: true } });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Book a Pooja</h1>
        <p className="text-white/60 mt-1">Performed by verified pandits, live-streamed to you.</p>

        {templates.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">
            Admin can add pooja templates from the admin panel.
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                {t.imageUrl && <img src={t.imageUrl} alt={t.name} className="w-full aspect-video object-cover" />}
                <div className="p-5">
                  <div className="text-xl text-white font-semibold">{t.name}</div>
                  <div className="text-white/60 text-sm mt-1">{t.description}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[var(--color-primary)] font-bold">₹ {t.basePrice.toString()}</div>
                    <a href={`/pooja/${t.slug}`} className="btn-primary text-sm py-2 px-4">Book</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
