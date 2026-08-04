import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Card, ButtonLink, Badge } from "@/components/ui";
import { formatIDR } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Dedicated Server | WangStore",
  description: "Dedicated Server bare-metal dengan performa tinggi dan stok terbatas.",
  alternates: { canonical: siteUrl("/products/dedicated") },
};

export default async function DedicatedServerPage() {
  const db = await read();

  return (
    <>
      <PageHero
        eyebrow="Dedicated Server"
        title="Dedicated Server"
        description="Server fisik eksklusif dengan performa maksimal. Stok terbatas."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {(db.dedicatedServers || []).map((server) => (
            <Card key={server.id} className={!server.available ? "opacity-60" : ""}>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-black">{server.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone={server.available ? "lime" : "muted"}>
                    {server.available ? `${server.stock} tersedia` : "Habis"}
                  </Badge>
                  <span className="text-xs text-[#8d83ad]">{server.location}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div><span className="text-[#8d83ad]">CPU</span><div className="font-bold">{server.cpu}</div></div>
                <div><span className="text-[#8d83ad]">RAM</span><div className="font-bold">{server.ram}</div></div>
                <div><span className="text-[#8d83ad]">Storage</span><div className="font-bold">{server.storage}</div></div>
                <div><span className="text-[#8d83ad]">Bandwidth</span><div className="font-bold">{server.bandwidth}</div></div>
              </div>

              <div className="mt-8 border-t border-[#241645] pt-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-4xl font-black text-[#c3ff3e]">
                    {formatIDR(server.price)}
                  </span>
                  <span className="text-[#8d83ad]">/bulan</span>
                </div>
              </div>

              <ButtonLink 
                href={server.available ? "/contact" : "#"} 
                className="mt-6 w-full" 
                size="lg"
              >
                {server.available ? "Pesan Dedicated Server" : "Stok Habis"}
              </ButtonLink>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-[#8d83ad]">
          Dedicated Server dikelola secara manual. Hubungi tim sales untuk ketersediaan dan provisioning.
        </div>
      </section>
    </>
  );
}
