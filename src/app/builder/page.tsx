import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { ServerBuilder } from "@/components/site/builder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Server Builder",
  description:
    "Racik server Anda sendiri: CPU, RAM, SSD/NVMe/HDD, bandwidth, OS, Java, versi Minecraft, software, panel, region, dan add-on dengan harga realtime.",
  alternates: { canonical: siteUrl("/builder") },
  openGraph: { title: "Server Builder | WangStore", url: siteUrl("/builder") },
};

export default async function BuilderPage() {
  const db = await read();

  return (
    <>
      <PageHero
        eyebrow="Server Builder"
        title="Racik server persis seperti yang Anda butuhkan"
        description="Tidak ada paket kaku. Geser slider, pilih software dan region, lalu lihat harga serta estimasi performa berubah seketika. Konfigurasi minimum 2 core / 4 GB RAM / 20 GB SSD mulai Rp45.000 per bulan."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ServerBuilder
          formula={db.priceFormula}
          regions={db.regions}
          whatsapp={db.settings.social.whatsapp}
          tier="pvnode"
        />
      </section>
    </>
  );
}
