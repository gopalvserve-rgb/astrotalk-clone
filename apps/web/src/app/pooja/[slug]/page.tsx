import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { resolveTenant, tenantDb } from "../../../lib/tenant";
import { notFound } from "next/navigation";
import BookForm from "./BookForm";

export default async function PoojaDetail({ params }: { params: { slug: string } }) {
  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const t = await db.poojaTemplate.findUnique({ where: { slug: params.slug } });
  if (!t || !t.isActive) notFound();
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {t.imageUrl && <img src={t.imageUrl} alt={t.name} className="w-full rounded-2xl aspect-video object-cover" />}
        <h1 className="font-display text-3xl font-bold text-white mt-6">{t.name}</h1>
        <p className="text-white/70 mt-2 whitespace-pre-wrap">{t.description}</p>
        <div className="mt-2 text-white/60 text-sm">Duration: {t.duration} · Price: ₹ {t.basePrice.toString()}</div>
        <BookForm templateId={t.id} price={Number(t.basePrice)} />
      </main>
      <Footer />
    </>
  );
}
