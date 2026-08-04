import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { ServerBuilder } from "@/components/site/builder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PVNode Ultra | WangStore",
  description: "PVNode Ultra — AMD Ryzen 9 9950X. Performa tertinggi untuk server Minecraft premium.",
  alternates: { canonical: siteUrl("/builder/pvnode-ultra") },
};

export default async function PVNodeUltraPage() {
  const db = await read();

  return (
    <>
      <PageHero
        eyebrow="PVNode Ultra"
        title="PVNode Ultra — AMD Ryzen 9 9950X"
        description="Performa flagship dengan AMD Ryzen 9 9950X. Cocok untuk komunitas besar dan modpack berat. Mulai Rp145.000/bulan."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ServerBuilder
          formula={db.priceFormula}
          whatsapp={db.settings.social.whatsapp}
          tier="pvnode_ultra"
        />
      </section>
    </>
  );
}
