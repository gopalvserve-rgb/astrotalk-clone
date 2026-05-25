import { getMasterDb } from "@astrotalk/db";
import { makeCredentialResolver } from "@astrotalk/shared";

export function tenantCredentials(tenantId: string) {
  const db = getMasterDb();
  return makeCredentialResolver({
    async read(key) {
      const r = await db.tenantSetting.findUnique({ where: { tenantId_key: { tenantId, key } } });
      return r?.value ?? null;
    },
    async write(key, value) {
      await db.tenantSetting.upsert({
        where: { tenantId_key: { tenantId, key } },
        update: { value },
        create: { tenantId, key, value },
      });
    },
  });
}
