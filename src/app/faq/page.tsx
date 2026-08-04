import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge, ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Jawaban atas pertanyaan paling umum tentang layanan, penagihan, performa, dan keamanan WangStore.",
  alternates: { canonical: siteUrl("/faq") },
  openGraph: { title: "FAQ WangStore", url: siteUrl("/faq") },
};

export default async function FaqPage() {
  const db = await read();
  const categories = [...new Set(db.faqs.map((f) => f.category))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: db.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Pertanyaan yang sering diajukan"
        description="Tidak menemukan jawaban? Tim kami siap membantu lewat WhatsApp, Discord, atau tiket dukungan."
      >
        <ButtonLink href="/contact">Hubungi Kami</ButtonLink>
        <ButtonLink href="/knowledge-base" variant="secondary">
          Knowledge Base
        </ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {categories.map((cat, ci) => (
          <div key={cat} className={ci > 0 ? "mt-12" : ""}>
            <Badge tone="brand">{cat}</Badge>
            <div className="mt-4 space-y-3">
              {db.faqs
                .filter((f) => f.category === cat)
                .map((f, i) => (
                  <Reveal key={f.id} delay={i * 0.04}>
                    <details className="brut-sm group bg-[#150f28] p-5">
                      <summary className="cursor-pointer list-none font-black marker:hidden">
                        <span className="flex items-center justify-between gap-4">
                          {f.question}
                          <span className="shrink-0 text-[#c3ff3e] transition-transform group-open:rotate-45">+</span>
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-[#a99fc8]">{f.answer}</p>
                    </details>
                  </Reveal>
                ))}
            </div>
          </div>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
