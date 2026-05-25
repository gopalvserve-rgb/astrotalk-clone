import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { resolveTenant, tenantDb } from "../../../lib/tenant";
import { notFound } from "next/navigation";
import DonateForm from "./DonateForm";

export default async function SewaDetail({ params }: { params: { slug: string } }) {
  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const c = await db.sewaCause.findUnique({ where: { slug: params.slug } });
  if (!c || !c.isActive) notFound();

  const pct = c.targetAmount ? Math.min(100, (Number(c.raisedAmount) / Number(c.targetAmount)) * 100) : 0;
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-full rounded-2xl aspect-video object-cover" />}
        <h1 className="font-display text-3xl font-bold text-white mt-6">{c.name}</h1>
        <p className="text-white/70 mt-2 whitespace-pre-wrap">{c.description}</p>
        {c.targetAmount && (
          <div className="mt-4">
            <div className="h-3 bg-white/10 rounded-full"><div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${pct}%` }} /></div>
            <div className="text-xs text-white/50 mt-1">₹ {c.raisedAmount.toString()} raised of ₹ {c.targetAmount.toString()}</div>
          </div>
        )}
        <DonateForm causeId={c.id} />
      </main>
      <Footer />
    </>
  );
}
