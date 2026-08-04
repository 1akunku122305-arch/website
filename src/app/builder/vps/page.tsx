import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { ServerBuilder } from "@/components/site/builder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VPS Builder | WangStore",
  description: "Bangun VPS Anda sendiri dengan Intel Xeon E5-2690 v4. Pilih CPU, RAM, Storage, OS, dan region.",
  alternates: { canonical: siteUrl("/builder/vps") },
};

export default async function VPSBuilderPage() {
  const db = await read();

  return (
    <>
      <PageHero
        eyebrow="VPS Builder"
        title="VPS Custom — Intel Xeon E5-2690 v4"
        description="Bangun VPS sesuai kebutuhan Anda. Mulai dari Rp42.000/bulan. Full root access + DDoS protection."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ServerBuilder
          formula={db.priceFormula}
          whatsapp={db.settings.social.whatsapp}
          tier="vps"
        />
      </section>
    </>
  );
}
