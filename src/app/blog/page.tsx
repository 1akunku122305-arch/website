import type { Metadata } from "next";
import { getPublishedPosts, siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { BlogIndex } from "@/components/site/blog-index";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Panduan teknis, catatan infrastruktur, dan praktik terbaik pengelolaan server dari tim engineering WangStore.",
  alternates: { canonical: siteUrl("/blog") },
  openGraph: { title: "Blog WangStore", url: siteUrl("/blog"), type: "website" },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog WangStore",
    url: siteUrl("/blog"),
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      datePublished: p.publishedAt,
      author: { "@type": "Person", name: p.author },
      url: siteUrl(`/blog/${p.slug}`),
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Catatan teknis dari ruang mesin"
        description="Kami menulis apa yang benar-benar kami jalankan: tuning performa, arsitektur jaringan, dan operasional komunitas."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <BlogIndex posts={posts} />
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
