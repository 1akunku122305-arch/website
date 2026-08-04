import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { ServerBuilder } from "@/components/site/builder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PVNode Pro | WangStore",
  description: "PVNode Pro — AMD EPYC Rome. Performa tinggi untuk server Minecraft skala besar.",
  alternates: { canonical: siteUrl("/builder/pvnode-pro") },
};

export default async function PVNodeProPage() {
  const db = await read();

  return (
    <>
      <PageHero
        eyebrow="PVNode Pro"
        title="PVNode Pro — AMD EPYC Rome"
        description="Performa kelas enterprise dengan AMD EPYC Rome. Ideal untuk jaringan besar dan komunitas aktif. Mulai Rp95.000/bulan."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ServerBuilder
          formula={db.priceFormula}
          regions={db.regions}
          whatsapp={db.settings.social.whatsapp}
          tier="pvnode_pro"
        />
      </section>
    </>
  );
}
