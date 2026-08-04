import type { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Card, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimoni",
  description: "Cerita nyata dari operator server, kreator, dan developer yang menjalankan layanan mereka di WangStore.",
  alternates: { canonical: siteUrl("/testimonials") },
  openGraph: { title: "Testimoni WangStore", url: siteUrl("/testimonials") },
};

export default async function TestimonialsPage() {
  const db = await read();
  const list = db.testimonials;
  const avg = Math.round((list.reduce((s, t) => s + t.rating, 0) / list.length) * 10) / 10;

  return (
    <>
      <PageHero
        eyebrow="Testimoni"
        title="Yang dikatakan pengguna WangStore"
        description="Kami tidak menulis ulang kata mereka. Ini yang benar-benar dikirim ke tim dukungan dan komunitas kami."
      >
        <ButtonLink href="/builder">Coba Sendiri</ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Rating rata-rata" value={`${avg} / 5`} sub={`${list.length} ulasan terverifikasi`} />
          <Stat label="Retensi pelanggan" value="94%" sub="12 bulan terakhir" />
          <Stat label="Server aktif" value="2.400+" sub="lintas lima region" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05}>
              <Card className="brut-hover h-full">
                <Quote className="h-7 w-7 text-[#7c3aed]" strokeWidth={2.6} />
                <p className="mt-4 text-sm leading-relaxed text-[#cdc3ea]">&ldquo;{t.body}&rdquo;</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-[#241645] pt-4">
                  <div>
                    <p className="font-black">{t.name}</p>
                    <p className="text-xs text-[#8d83ad]">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5" aria-label={`${t.rating} dari 5 bintang`}>
                    {Array.from({ length: 5 }, (_, n) => (
                      <Star
                        key={n}
                        className={n < t.rating ? "h-4 w-4 fill-[#c3ff3e] text-[#c3ff3e]" : "h-4 w-4 text-[#3a2a63]"}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
