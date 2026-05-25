import { AdminShell } from "@/components/AdminShell";

export default async function BillingPage({ params }: { params: { id: string } }) {
  // Phase 8.x — read actual usage from tenant DB (AI calls, consultations, storage)
  return (
    <AdminShell title="Tenant Billing">
      <p className="text-white/60">License + usage-based billing for this tenant.</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card label="Monthly Active Users" value="—" />
        <Card label="AI Calls (this month)" value="—" />
        <Card label="Consultation Minutes" value="—" />
        <Card label="Storage Used" value="—" />
        <Card label="Wallet Throughput" value="—" />
        <Card label="License Plan" value="Standard" />
      </div>
    </AdminShell>
  );
}
function Card({ label, value }: { label: string; value: string }) {
  return <div className="card p-4"><div className="text-white/60 text-sm">{label}</div><div className="text-2xl font-semibold mt-1">{value}</div></div>;
}
