import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { resolveTenant, tenantDb } from "../../../lib/tenant";
import { notFound } from "next/navigation";
import YatraBookForm from "./YatraBookForm";

export default async function YatraDetail({ params }: { params: { slug: string } }) {
  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const y = await db.yatra.findUnique({ where: { slug: params.slug } });
  if (!y || !y.isActive) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {y.imageUrl && <img src={y.imageUrl} alt={y.name} className="w-full rounded-2xl aspect-video object-cover" />}
        <h1 className="font-display text-3xl font-bold text-white mt-6">{y.name}</h1>
        <div className="mt-2 text-white/60 text-sm">{y.destinations.join(" · ")}</div>
        <p className="text-white/70 mt-2 whitespace-pre-wrap">{y.description}</p>
        <div className="text-[var(--color-primary)] text-2xl font-bold mt-2">₹ {y.price.toString()} <span className="text-white/50 text-sm font-normal">per person</span></div>
        <div className="text-white/50 text-xs mt-1">Available seats: {Math.max(0, y.capacity - y.bookedCount)}</div>
        <YatraBookForm yatraId={y.id} price={Number(y.price)} available={Math.max(0, y.capacity - y.bookedCount)} />
      </main>
      <Footer />
    </>
  );
}
