import { AdminShell } from "../../../components/admin/AdminShell";
import { MODULES } from "@astrotalk/shared";


export const dynamic = "force-dynamic";
export default function ModulesPage() {
  return (
    <AdminShell title="Module Catalogue">
      <p className="text-white/60">All modules available in the platform. Toggle per-tenant on the Tenant page.</p>
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {Object.values(MODULES).map(m => (
          <div key={m.key} className="card p-4 flex items-center gap-3">
            <div className="text-2xl">{m.icon}</div>
            <div className="flex-1">
              <div className="font-semibold">{m.label}</div>
              <div className="text-white/50 text-xs">{m.description}</div>
              <div className="text-amber-300/80 text-[10px] mt-1">{m.key} · {m.tab}</div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
