import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "../../lib/tenant";
import { notFound } from "next/navigation";

export default async function ChatPage() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "chat_with_astrologer")) notFound();
  const db = await tenantDb(tenant);
  const astrologers = await db.astrologer.findMany({
    where: { status: "active", category: "ASTROLOGY" },
    orderBy: [{ isOnline: "desc" }, { isFeatured: "desc" }, { rating: "desc" }],
    take: 24,
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Chat with Astrologer</h1>
        <p className="text-white/60 mt-1">Verified astrologers · 24×7 · First chat free</p>

        {astrologers.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">
            Admin can add real or AI astrologers from the admin panel.
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {astrologers.map((a) => (
              <div key={a.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  {a.avatarUrl
                    ? <img src={a.avatarUrl} className="w-14 h-14 rounded-full" alt="" />
                    : <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white">🧙</div>}
                  <div className="flex-1">
                    <div className="text-white font-semibold flex items-center gap-2">
                      {a.displayName ?? a.name}
                      {a.type === "AI" && <span className="text-xs bg-[var(--color-accent)] text-[var(--color-secondary)] px-2 py-0.5 rounded-full">AI</span>}
                      {a.isCelebrity && <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">Celebrity</span>}
                    </div>
                    <div className="text-white/60 text-xs">{a.specialties.slice(0, 3).join(" · ")}</div>
                    <div className="text-white/60 text-xs">★ {a.rating.toFixed(1)} · {a.totalOrders}+ orders</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-[var(--color-primary)] font-bold">₹ {a.rateChatPerMin.toString()}/min</div>
                  <a href={`/chat-with-astrologer/${a.id}`} className="btn-primary text-sm py-2 px-4">
                    {a.isOnline ? "Chat" : "Offline"}
                  </a>
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
