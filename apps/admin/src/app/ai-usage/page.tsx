import { AdminShell } from "../../components/AdminShell";
import { getMasterDb, getTenantDb } from "@astrotalk/db";

export const dynamic = "force-dynamic";

export default async function AIUsagePage() {
  const master = getMasterDb();
  const tenants = await master.tenant.findMany({ where: { status: "ACTIVE" } });

  // Aggregate stats across tenants (each tenant DB has its own ai_reports)
  type Row = { tenant: string; kind: string; provider: string; count: number; cost: number; durationMs: number };
  const allRows: Row[] = [];

  for (const t of tenants) {
    try {
      const db = getTenantDb(t.id, t.dbConnString);
      const grouped = await db.aiReport.groupBy({
        by: ["kind", "provider"],
        _count: true,
        _sum: { cost: true, durationMs: true },
        where: { status: "done" },
      });
      for (const g of grouped) {
        allRows.push({
          tenant: t.slug,
          kind: g.kind,
          provider: g.provider,
          count: g._count,
          cost: Number(g._sum.cost ?? 0),
          durationMs: Number(g._sum.durationMs ?? 0),
        });
      }
    } catch (e) {
      console.error("tenant aggregate failed", t.slug, e);
    }
  }

  // Top-level numbers
  const totalCalls = allRows.reduce((s, r) => s + r.count, 0);
  const totalCost = allRows.reduce((s, r) => s + r.cost, 0);
  const byProvider: Record<string, { count: number; cost: number }> = {};
  const byKind:     Record<string, { count: number; cost: number }> = {};
  for (const r of allRows) {
    byProvider[r.provider] ??= { count: 0, cost: 0 };
    byProvider[r.provider]!.count += r.count;
    byProvider[r.provider]!.cost  += r.cost;
    byKind[r.kind] ??= { count: 0, cost: 0 };
    byKind[r.kind]!.count += r.count;
    byKind[r.kind]!.cost  += r.cost;
  }

  // Last 50 individual calls
  const recent: Array<{ tenant: string; userId: string; kind: string; provider: string; model: string;
                       status: string; cost: number; durationMs: number; createdAt: Date }> = [];
  for (const t of tenants) {
    try {
      const db = getTenantDb(t.id, t.dbConnString);
      const r = await db.aiReport.findMany({
        orderBy: { createdAt: "desc" }, take: 50,
      });
      for (const x of r) recent.push({
        tenant: t.slug, userId: x.userId, kind: x.kind, provider: x.provider, model: x.model,
        status: x.status, cost: Number(x.cost ?? 0), durationMs: x.durationMs ?? 0, createdAt: x.createdAt,
      });
    } catch {}
  }
  recent.sort((a, b) => +b.createdAt - +a.createdAt);

  return (
    <AdminShell title="AI Usage & Cost">
      <p className="text-white/60">Tracks every Gemini + DeepSeek call across all tenants. Cost is estimated from token counts.</p>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card label="Total Calls"     value={totalCalls.toLocaleString()} />
        <Card label="Total Cost"      value={`$${totalCost.toFixed(4)}`} />
        <Card label="Avg Cost / Call" value={totalCalls ? `$${(totalCost / totalCalls).toFixed(4)}` : "—"} />
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Section title="Cost by Provider">
          <Table headers={["Provider", "Calls", "Cost (USD)"]} rows={Object.entries(byProvider).map(([k,v]) => [k, v.count, `$${v.cost.toFixed(4)}`])} />
        </Section>
        <Section title="Cost by Feature">
          <Table headers={["Feature", "Calls", "Cost (USD)"]} rows={Object.entries(byKind).map(([k,v]) => [k.toLowerCase().replace(/_/g," "), v.count, `$${v.cost.toFixed(4)}`])} />
        </Section>
      </div>

      <Section title="By Tenant + Feature + Provider">
        <Table
          headers={["Tenant", "Feature", "Provider", "Calls", "Cost", "Avg ms"]}
          rows={allRows.map(r => [r.tenant, r.kind.toLowerCase().replace(/_/g," "), r.provider, r.count, `$${r.cost.toFixed(4)}`, r.count ? Math.round(r.durationMs/r.count) : "—"])}
        />
      </Section>

      <Section title="Recent 50 calls">
        <Table
          headers={["When", "Tenant", "User", "Feature", "Provider", "Model", "Status", "Cost", "ms"]}
          rows={recent.slice(0, 50).map(r => [
            new Date(r.createdAt).toLocaleString(),
            r.tenant,
            r.userId.slice(0, 6) + "…",
            r.kind.toLowerCase().replace(/_/g," "),
            r.provider, r.model,
            r.status,
            `$${r.cost.toFixed(4)}`,
            r.durationMs,
          ])}
        />
      </Section>
    </AdminShell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: (string|number)[][] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-white/60 text-left">
          <tr>{headers.map(h => <th key={h} className="p-3 capitalize">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={headers.length} className="p-6 text-white/50 text-center">No data yet</td></tr> :
            rows.map((r, i) => (
              <tr key={i} className="border-t border-white/5">
                {r.map((c, j) => <td key={j} className="p-3">{c as any}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
