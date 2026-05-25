/**
 * Daily horoscope auto-generation — runs at 00:05 IST.
 *
 *   node --loader tsx apps/web/src/jobs/horoscope-daily.ts
 *
 * Generates daily horoscope articles for all 12 zodiac signs in each tenant.
 * Uses Gemini (low latency) by default. Each article is persisted to
 * `articles` table with category=horoscope, zodiac=<sign>, horoscopeType="daily".
 */

import { getMasterDb, getTenantDb } from "@astrotalk/db";
import { ai } from "@astrotalk/ai";
import { ZODIAC_SIGNS } from "@astrotalk/shared";

async function runForTenant(tenantId: string, conn: string) {
  const db = getTenantDb(tenantId, conn);
  const today = new Date().toISOString().slice(0,10);
  for (const sign of ZODIAC_SIGNS) {
    const exists = await db.article.findFirst({
      where: { category: "horoscope", zodiac: sign, horoscopeType: "daily", publishedAt: { gte: new Date(today) } },
    });
    if (exists) continue;
    try {
      const out = await ai.complete({ task: "horoscope_daily", input: { sign, date: today }, forceProvider: "gemini" });
      await db.article.create({
        data: {
          slug: `horoscope-${sign}-${today}`,
          title: `${sign.charAt(0).toUpperCase()+sign.slice(1)} Daily Horoscope — ${today}`,
          excerpt: out.text.slice(0, 160),
          body: out.text,
          category: "horoscope", zodiac: sign, horoscopeType: "daily",
          publishedAt: new Date(), isPublished: true,
        },
      });
    } catch (e) {
      console.error(`Failed horoscope ${sign} for tenant ${tenantId}:`, e);
    }
  }
}

async function main() {
  const master = getMasterDb();
  const tenants = await master.tenant.findMany({ where: { status: "ACTIVE" } });
  for (const t of tenants) {
    console.log(`Generating horoscope for tenant ${t.slug}…`);
    await runForTenant(t.id, t.dbConnString);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
