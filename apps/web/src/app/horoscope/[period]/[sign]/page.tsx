import { Header } from "../../../../components/Header";
import { Footer } from "../../../../components/Footer";
import { ai } from "@astrotalk/ai";
import { resolveTenant, tenantDb } from "../../../../lib/tenant";

export const revalidate = 21600; // 6 hours

export default async function HoroscopeSign({ params }: { params: { period: string; sign: string } }) {
  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);

  // Try DB first (admin can override AI output)
  const article = await db.article.findFirst({
    where: { category: "horoscope", zodiac: params.sign, horoscopeType: params.period, isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
  let body = article?.body;
  if (!body) {
    try {
      const out = await ai.complete({
        task: "horoscope_daily",
        input: { sign: params.sign, period: params.period, date: new Date().toISOString().slice(0,10) },
      });
      body = out.text;
    } catch { body = "Horoscope will be available shortly."; }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-[var(--color-primary)] uppercase tracking-widest text-xs">{params.period} Horoscope</div>
        <h1 className="font-display text-4xl font-bold text-white capitalize mt-1">{params.sign}</h1>
        <article className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 text-white/90 whitespace-pre-wrap leading-relaxed">{body}</article>
      </main>
      <Footer />
    </>
  );
}
