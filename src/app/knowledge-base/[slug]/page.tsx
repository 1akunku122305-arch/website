import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArticle, getArticles, renderMarkdown, siteUrl } from "@/lib/content";
import { Badge, Card, Prose } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  return {
    title: article.title,
    description: `${article.title} — panduan resmi WangStore kategori ${article.category}.`,
    alternates: { canonical: siteUrl(`/knowledge-base/${article.slug}`) },
    openGraph: { title: article.title, url: siteUrl(`/knowledge-base/${article.slug}`), type: "article" },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const others = (await getArticles()).filter((a) => a.slug !== article.slug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    dateModified: article.updatedAt,
    articleSection: article.category,
    publisher: { "@type": "Organization", name: "WangStore" },
    mainEntityOfPage: siteUrl(`/knowledge-base/${article.slug}`),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link href="/knowledge-base" className="inline-flex items-center gap-2 text-sm font-bold text-[#c084fc] hover:text-[#c3ff3e]">
        <ArrowLeft className="h-4 w-4" /> Kembali ke knowledge base
      </Link>
      <Badge tone="brand" className="mt-6">{article.category}</Badge>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-black leading-tight sm:text-4xl">
        {article.title}
      </h1>
      <p className="mt-3 text-xs text-[#8d83ad]">Diperbarui {formatDate(article.updatedAt)}</p>

      <Prose className="mt-8">
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }} />
      </Prose>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-black">Panduan lainnya</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {others.map((o) => (
            <Card key={o.slug} className="brut-hover p-5">
              <h3 className="text-sm font-black">
                <Link href={`/knowledge-base/${o.slug}`} className="hover:text-[#c3ff3e]">
                  {o.title}
                </Link>
              </h3>
              <p className="mt-1 text-xs text-[#8d83ad]">{o.category}</p>
            </Card>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
