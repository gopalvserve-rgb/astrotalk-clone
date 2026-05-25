import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { resolveTenant, tenantDb } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const tenant = await resolveTenant(); const db = await tenantDb(tenant);
  const post = await db.article.findUnique({ where: { slug: params.slug } });
  if (!post || !post.isPublished) notFound();
  await db.article.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {post.coverUrl && <img src={post.coverUrl} alt="" className="w-full rounded-2xl aspect-video object-cover" />}
        <div className="text-xs text-white/50 uppercase mt-6">{post.category}</div>
        <h1 className="font-display text-4xl font-bold text-white mt-2">{post.title}</h1>
        <article className="mt-6 prose prose-invert max-w-none text-white/90 whitespace-pre-wrap leading-relaxed">{post.body}</article>
      </main>
      <Footer />
    </>
  );
}
