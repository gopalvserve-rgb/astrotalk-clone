import { AdminShell } from "@/components/AdminShell";
import { getMasterDb } from "@astrotalk/db";
import { MODULES, type ModuleKey } from "@astrotalk/shared";
import { revalidatePath } from "next/cache";

export default async function TenantDetail({ params }: { params: { id: string } }) {
  const db = getMasterDb();
  const t = await db.tenant.findUniqueOrThrow({
    where: { id: params.id },
    include: { domains: true, modules: true, theme: true },
  });

  async function toggle(formData: FormData) {
    "use server";
    const moduleKey = String(formData.get("moduleKey")) as ModuleKey;
    const enabled = formData.get("enabled") === "on";
    await getMasterDb().tenantModule.upsert({
      where: { tenantId_moduleKey: { tenantId: t.id, moduleKey } },
      update: { enabled },
      create: { tenantId: t.id, moduleKey, enabled },
    });
    revalidatePath(`/tenants/${t.id}`);
  }

  const enabledMap = new Map(t.modules.map(m => [m.moduleKey, m.enabled]));

  return (
    <AdminShell title={t.name}>
      <div className="text-white/60 text-sm">Slug: {t.slug} · Status: {t.status}</div>
      <div className="mt-3 flex gap-2"><a href={`/tenants/${t.id}/settings`} className="btn-outline text-xs">🔑 API Keys</a><a href={`/tenants/${t.id}/theme`} className="btn-outline text-xs">🎨 Theme</a><a href={`/tenants/${t.id}/billing`} className="btn-outline text-xs">💳 Billing</a></div>

      <h2 className="mt-8 text-xl font-semibold">Domains</h2>
      <ul className="card mt-2 divide-y divide-white/5">
        {t.domains.map(d => (
          <li key={d.id} className="p-3 flex justify-between">
            <span>{d.domain} {d.isPrimary && <span className="text-amber-300 text-xs">(primary)</span>}</span>
            <span className="text-white/50 text-xs">{d.verified ? "✔ verified" : "unverified"}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Modules</h2>
      <p className="text-white/60 text-sm">Toggle features on/off for this tenant. Changes apply immediately.</p>

      <div className="mt-3 grid md:grid-cols-2 gap-3">
        {Object.values(MODULES).map(m => {
          const on = enabledMap.get(m.key) ?? m.defaultOn;
          return (
            <form key={m.key} action={toggle} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{m.icon}</div>
                <div>
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-white/50 text-xs">{m.description}</div>
                </div>
              </div>
              <input type="hidden" name="moduleKey" value={m.key} />
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" name="enabled" defaultChecked={on}
                  className="appearance-none w-10 h-6 bg-white/10 rounded-full relative
                             checked:bg-amber-500 transition
                             before:content-[''] before:absolute before:top-1 before:left-1
                             before:w-4 before:h-4 before:bg-white before:rounded-full
                             checked:before:translate-x-4 before:transition" />
              </label>
              <button type="submit" className="hidden">save</button>
            </form>
          );
        })}
      </div>
    </AdminShell>
  );
}
