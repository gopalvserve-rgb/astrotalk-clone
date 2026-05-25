import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function MantrasPage() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "meditation_mantra")) notFound();
  const db = await tenantDb(tenant);
  const items = await db.mediaItem.findMany({ where: { isActive: true, kind: "mantra" } });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Mantras</h1>
        <p className="text-white/60 mt-1">Audio + text mantras for daily chanting.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">No mantras yet.</div>
          ) : items.map(m => (
            <div key={m.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="font-semibold text-white">{m.title}</div>
              {m.description && <div className="text-white/60 text-sm mt-1">{m.description}</div>}
              <audio src={m.audioUrl} controls className="w-full mt-3" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
