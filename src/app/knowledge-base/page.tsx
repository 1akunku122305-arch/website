import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getArticles, siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Dokumentasi langkah demi langkah: menghubungkan domain, mengatasi TPS rendah, backup & restore, dan keamanan akun.",
  alternates: { canonical: siteUrl("/knowledge-base") },
  openGraph: { title: "Knowledge Base WangStore", url: siteUrl("/knowledge-base") },
};

export default async function KnowledgeBasePage() {
  const articles = await getArticles();
  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <>
      <PageHero
        eyebrow="Knowledge Base"
        title="Dokumentasi yang langsung bisa dieksekusi"
        description="Panduan singkat dan konkret untuk tugas-tugas yang paling sering dilakukan pelanggan kami."
      >
        <ButtonLink href="/contact" variant="secondary">
          Butuh Bantuan Langsung
        </ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {categories.map((cat, ci) => (
          <div key={cat} className={ci > 0 ? "mt-12" : ""}>
            <Badge tone="brand">{cat}</Badge>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {articles
                .filter((a) => a.category === cat)
                .map((a, i) => (
                  <Reveal key={a.slug} delay={i * 0.05}>
                    <Card className="brut-hover h-full">
                      <BookOpen className="h-6 w-6 text-[#c3ff3e]" strokeWidth={2.4} />
                      <h2 className="mt-3 font-[family-name:var(--font-display)] text-lg font-black">
                        <Link href={`/knowledge-base/${a.slug}`} className="hover:text-[#c3ff3e]">
                          {a.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-xs text-[#8d83ad]">Diperbarui {formatDate(a.updatedAt)}</p>
                    </Card>
                  </Reveal>
                ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
