import { PrismaClient } from "@prisma/client";

// =====================================================================
// Multi-tenant Prisma client cache
// =====================================================================
//
// Each tenant has its own database. We keep one PrismaClient instance
// per tenant id in a process-wide cache. The master DB client uses the
// default DATABASE_URL env var.
//
// Usage:
//   const masterDb = getMasterDb();
//   const tenantDb = getTenantDb(tenantId, tenant.dbConnString);
//
// =====================================================================

const tenantClients = new Map<string, PrismaClient>();

declare global {
  // eslint-disable-next-line no-var
  var __masterPrisma: PrismaClient | undefined;
}

export function getMasterDb(): PrismaClient {
  if (!global.__masterPrisma) {
    global.__masterPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return global.__masterPrisma;
}

export function getTenantDb(tenantId: string, connectionString: string): PrismaClient {
  const cached = tenantClients.get(tenantId);
  if (cached) return cached;

  const client = new PrismaClient({
    datasources: { db: { url: connectionString } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  tenantClients.set(tenantId, client);
  return client;
}

export async function disconnectAll(): Promise<void> {
  for (const [, client] of tenantClients) {
    await client.$disconnect();
  }
  tenantClients.clear();
  if (global.__masterPrisma) {
    await global.__masterPrisma.$disconnect();
    global.__masterPrisma = undefined;
  }
}

export * from "@prisma/client";
