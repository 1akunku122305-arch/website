import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dokumen Legal",
  description: "Terms of Service, Privacy Policy, Refund Policy, SLA, Acceptable Use Policy, dan Cookie Policy WangStore.",
  alternates: { canonical: siteUrl("/legal") },
};

export default async function LegalIndexPage() {
  const db = await read();
  const entries = Object.entries(db.settings.legal);

  return (
    <>
      <PageHero eyebrow="Legal" title="Dokumen resmi WangStore" description="Semua ketentuan tertulis jelas, tanpa jebakan pasal tersembunyi." />
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {entries.map(([slug, doc]) => (
            <Card key={slug} className="brut-hover h-full">
              <FileText className="h-6 w-6 text-[#c3ff3e]" strokeWidth={2.4} />
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-lg font-black">
                <Link href={`/legal/${slug}`} className="hover:text-[#c3ff3e]">
                  {doc.title}
                </Link>
              </h2>
              <p className="mt-1 text-xs text-[#8d83ad]">Diperbarui {formatDate(doc.updatedAt)}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
