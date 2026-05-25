import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function DarshanPage() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "live_darshan")) notFound();
  const db = await tenantDb(tenant);
  const streams = await db.liveDarshan.findMany({ where: { isActive: true }, orderBy: { isLive: "desc" } });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Live Darshan</h1>
        <p className="text-white/60 mt-1">Live streams from temples — YouTube + user uploaded.</p>

        {streams.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">
            Admin can add live darshan streams (YouTube embeds or RTMP).
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {streams.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="aspect-video bg-black relative">
                  {s.type === "youtube" ? (
                    <iframe src={s.url} className="w-full h-full" allow="autoplay; encrypted-media" />
                  ) : (
                    <video src={s.url} controls className="w-full h-full" />
                  )}
                  {s.isLive && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">● LIVE</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-white font-semibold">{s.title}</div>
                  <div className="text-white/50 text-xs mt-1">{s.description}</div>
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
