import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "../../lib/tenant";
import { notFound } from "next/navigation";


export const dynamic = "force-dynamic";
export default async function SewaPage() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "sewa")) notFound();
  const db = await tenantDb(tenant);
  const causes = await db.sewaCause.findMany({ where: { isActive: true } });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Sewa & Donations</h1>
        <p className="text-white/60 mt-1">Ann Daan · Pashu Sewa · Mandir · Vastra Daan · and more.</p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {causes.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">
              Admin can add sewa causes from the admin panel.
            </div>
          ) : causes.map((c) => {
            const pct = c.targetAmount ? Math.min(100, (Number(c.raisedAmount) / Number(c.targetAmount)) * 100) : 0;
            return (
              <div key={c.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-xl text-white font-semibold">{c.name}</div>
                <div className="text-white/60 text-sm mt-1">{c.description}</div>
                {c.targetAmount && (
                  <div className="mt-3">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-primary)]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      ₹ {c.raisedAmount.toString()} / ₹ {c.targetAmount.toString()}
                    </div>
                  </div>
                )}
                <a href={`/sewa/${c.slug}`} className="btn-primary mt-4 text-sm py-2 px-4 inline-flex">Donate</a>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
