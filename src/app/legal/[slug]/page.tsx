import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { read } from "@/lib/db";
import { renderMarkdown, siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Card, Prose } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const ORDER = ["terms", "privacy", "refund", "sla", "aup", "cookie"];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const db = await read();
  const doc = db.settings.legal[slug];
  if (!doc) return { title: "Dokumen tidak ditemukan" };
  return {
    title: doc.title,
    description: `${doc.title} resmi WangStore, diperbarui ${doc.updatedAt}.`,
    alternates: { canonical: siteUrl(`/legal/${slug}`) },
    openGraph: { title: `${doc.title} | WangStore`, url: siteUrl(`/legal/${slug}`) },
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const db = await read();
  const doc = db.settings.legal[slug];
  if (!doc) notFound();

  const nav = ORDER.filter((k) => db.settings.legal[k]);

  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} description={`Terakhir diperbarui ${formatDate(doc.updatedAt)}`} />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Dokumen legal" className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-4">
            <p className="label px-2">Dokumen</p>
            <ul className="mt-3 space-y-1">
              {nav.map((key) => (
                <li key={key}>
                  <Link
                    href={`/legal/${key}`}
                    className={`block rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                      key === slug ? "bg-[#241645] text-[#c3ff3e]" : "text-[#cdc3ea] hover:bg-[#1b1233]"
                    }`}
                  >
                    {db.settings.legal[key].title}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </nav>

        <Card>
          <Prose>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.body) }} />
          </Prose>
          <p className="mt-10 border-t-2 border-[#241645] pt-5 text-xs text-[#8d83ad]">
            Pertanyaan mengenai dokumen ini dapat dikirim ke {db.settings.contact.email}.
          </p>
        </Card>
      </section>
    </>
  );
}
