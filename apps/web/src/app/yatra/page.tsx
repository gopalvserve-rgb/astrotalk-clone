import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function YatraPage() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "yatra_booking")) notFound();
  const db = await tenantDb(tenant);
  const yatras = await db.yatra.findMany({ where: { isActive: true } });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Yatra Booking</h1>
        <p className="text-white/60 mt-1">Book your pilgrimage with verified operators.</p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {yatras.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">
              No yatras listed yet.
            </div>
          ) : yatras.map((y) => (
            <div key={y.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              {y.imageUrl && <img src={y.imageUrl} alt={y.name} className="w-full aspect-video object-cover" />}
              <div className="p-5">
                <div className="text-xl text-white font-semibold">{y.name}</div>
                <div className="text-white/60 text-sm mt-1">{y.destinations.join(" · ")}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-[var(--color-primary)] font-bold">₹ {y.price.toString()}</div>
                  <a href={`/yatra/${y.slug}`} className="btn-primary text-sm py-2 px-4">Book</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
