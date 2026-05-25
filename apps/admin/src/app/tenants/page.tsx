import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { getMasterDb } from "@astrotalk/db";

export default async function TenantsPage() {
  const db = getMasterDb();
  const tenants = await db.tenant.findMany({
    include: { domains: true, _count: { select: { modules: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <AdminShell title="Tenants">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60 text-left">
            <tr><th className="p-3">Slug</th><th>Name</th><th>Status</th><th>Domains</th><th>Modules</th><th></th></tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="border-t border-white/5">
                <td className="p-3 text-amber-300">{t.slug}</td>
                <td>{t.name}</td>
                <td>{t.status}</td>
                <td>{t.domains.map(d => d.domain).join(", ")}</td>
                <td>{t._count.modules}</td>
                <td>
                  <Link href={`/tenants/${t.id}`} className="btn-outline text-xs">Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
