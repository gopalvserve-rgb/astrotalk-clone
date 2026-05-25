/**
 * Tenant-aware GA4 / Mixpanel wrapper.
 * Reads measurement IDs from tenant_settings (key=ga4_id, mp_token).
 */
import { getMasterDb } from "@astrotalk/db";

export async function getAnalyticsIdsForHost(host: string): Promise<{ ga4?: string; mp?: string }> {
  const db = getMasterDb();
  const dom = await db.tenantDomain.findUnique({ where: { domain: host.split(":")[0]! }, include: { tenant: { include: { settings: true } } } });
  if (!dom) return {};
  const ga4 = dom.tenant.settings.find(s => s.key === "ga4_id")?.value ?? undefined;
  const mp  = dom.tenant.settings.find(s => s.key === "mp_token")?.value ?? undefined;
  return { ga4, mp };
}
