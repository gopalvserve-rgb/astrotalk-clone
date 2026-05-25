/**
 * Tenant resolution from the request Host header.
 *
 * Phase 1 strategy:
 *   1. Read Host header
 *   2. Strip port → lookup in master DB `TenantDomain` table
 *   3. Cache resolved tenant for the request lifecycle
 *   4. Return TenantContext (id, slug, theme, enabledModules[])
 *
 * If the domain isn't registered, fall back to the "demo" tenant in dev.
 */

import { headers } from "next/headers";
import { getMasterDb, getTenantDb } from "@astrotalk/db";
import type { TenantContext } from "@astrotalk/shared";

export async function resolveTenant(): Promise<TenantContext> {
  const h = headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "localhost")
    .split(":")[0]!
    .toLowerCase();

  const db = getMasterDb();
  let domain = await db.tenantDomain.findUnique({
    where: { domain: host },
    include: { tenant: { include: { theme: true, modules: true } } },
  });

  if (!domain) {
    // dev fallback — demo tenant
    domain = await db.tenantDomain.findFirst({
      where: { tenant: { slug: "demo" } },
      include: { tenant: { include: { theme: true, modules: true } } },
    });
    if (!domain) throw new Error("No tenant found and no demo fallback");
  }

  const t = domain.tenant;
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    primaryDomain: host,
    theme: {
      brandName: t.theme?.brandName ?? "Astrotalk",
      logoUrl: t.theme?.logoUrl ?? null,
      primaryColor: t.theme?.primaryColor ?? "#F26B1D",
      secondaryColor: t.theme?.secondaryColor ?? "#1A1230",
      accentColor: t.theme?.accentColor ?? "#F5C518",
    },
    enabledModules: t.modules.filter((m) => m.enabled).map((m) => m.moduleKey),
  };
}

export async function tenantDb(tenant: TenantContext) {
  const master = getMasterDb();
  const t = await master.tenant.findUnique({ where: { id: tenant.id } });
  if (!t) throw new Error("Tenant not found");
  return getTenantDb(t.id, t.dbConnString);
}

export function isModuleEnabled(tenant: TenantContext, key: string): boolean {
  return tenant.enabledModules.includes(key);
}
