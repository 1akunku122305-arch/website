import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPost, getPublishedPosts, renderMarkdown, siteUrl } from "@/lib/content";
import { Badge, Card, Prose } from "@/components/ui";
import { formatDate, readingTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: siteUrl(`/blog/${post.slug}`) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: siteUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const all = await getPublishedPosts();
  const related = all.filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t))).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "WangStore", logo: { "@type": "ImageObject", url: siteUrl("/brand/logo.svg") } },
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
    keywords: post.tags.join(", "),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#c084fc] hover:text-[#c3ff3e]">
        <ArrowLeft className="h-4 w-4" /> Kembali ke blog
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="brand">{post.category}</Badge>
        {post.tags.map((t) => (
          <Badge key={t} tone="muted">#{t}</Badge>
        ))}
      </div>

      <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-black leading-tight sm:text-5xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#8d83ad]">
        <span className="font-bold text-[#cdc3ea]">{post.author}</span>
        <span>•</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span>•</span>
        <span>{readingTime(post.body)} menit baca</span>
      </div>

      <p className="mt-6 border-l-4 border-[#a855f7] pl-4 text-base leading-relaxed text-[#cdc3ea]">{post.excerpt}</p>

      <Prose className="mt-8">
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </Prose>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-black">Artikel terkait</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Card key={r.slug} as="article" className="brut-hover h-full p-5">
                <h3 className="text-sm font-black leading-snug">
                  <Link href={`/blog/${r.slug}`} className="hover:text-[#c3ff3e]">
                    {r.title}
                  </Link>
                </h3>
                <p className="mt-2 text-xs text-[#8d83ad]">{formatDate(r.publishedAt)}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
