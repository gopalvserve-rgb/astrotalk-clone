/**
 * Per-user daily AI cost cap. Reads AI_DAILY_USD_CAP_PER_USER from env.
 * Persists rolling 24h spend in memory (Phase 9 will switch to Redis).
 */
const SPEND = new Map<string, { day: string; usd: number }>();
const CAP = parseFloat(process.env.AI_DAILY_USD_CAP_PER_USER || "2.00");

function today() { return new Date().toISOString().slice(0,10); }

export function canSpend(userId: string, estUsd: number): boolean {
  const day = today();
  const rec = SPEND.get(userId);
  const used = rec && rec.day === day ? rec.usd : 0;
  return used + estUsd <= CAP;
}
export function record(userId: string, usd: number) {
  const day = today();
  const rec = SPEND.get(userId);
  const used = rec && rec.day === day ? rec.usd : 0;
  SPEND.set(userId, { day, usd: used + usd });
}
