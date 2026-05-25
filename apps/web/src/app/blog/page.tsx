import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { resolveTenant, tenantDb, isModuleEnabled } from "../../lib/tenant";
import { notFound } from "next/navigation";


export const dynamic = "force-dynamic";
export default async function BlogIndex() {
  const tenant = await resolveTenant();
  if (!isModuleEnabled(tenant, "blog")) notFound();
  const db = await tenantDb(tenant);
  const posts = await db.article.findMany({ where: { isPublished: true, NOT: { category: "horoscope" } }, orderBy: { publishedAt: "desc" }, take: 30 });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Blog</h1>
        <p className="text-white/60 mt-1">Astrology, numerology, vastu articles + insights.</p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="md:col-span-3 rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/60">No posts yet.</div>
          ) : posts.map(p => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-[var(--color-primary)]">
              {p.coverUrl && <img src={p.coverUrl} alt="" className="w-full aspect-video object-cover" />}
              <div className="p-4">
                <div className="text-xs text-white/50 uppercase">{p.category}</div>
                <div className="font-semibold text-white mt-1">{p.title}</div>
                <div className="text-white/60 text-sm mt-2 line-clamp-2">{p.excerpt}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
