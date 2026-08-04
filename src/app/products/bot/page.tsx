import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Card, ButtonLink, Badge } from "@/components/ui";
import { formatIDR } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Bot Hosting | WangStore",
  description: "Hosting bot Discord, Telegram, dan custom bot dengan uptime 99.9%.",
  alternates: { canonical: siteUrl("/products/bot") },
};

export default async function BotHostingPage() {
  const db = await read();

  return (
    <>
      <PageHero
        eyebrow="Bot Hosting"
        title="Bot Hosting 24/7"
        description="Jalankan bot Discord, Telegram, atau custom bot Anda dengan uptime tinggi dan proteksi DDoS."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {db.botHosting.map((pkg) => (
            <Card key={pkg.id} className={pkg.popular ? "ring-2 ring-[#c3ff3e]" : ""}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-black">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-[#8d83ad]">{pkg.description}</p>
                </div>
                {pkg.popular && <Badge tone="lime">Paling Populer</Badge>}
              </div>

              <div className="mt-6">
                <span className="font-[family-name:var(--font-display)] text-5xl font-black text-[#c3ff3e]">
                  {formatIDR(pkg.price)}
                </span>
                <span className="text-[#8d83ad]">/bulan</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
                <div><span className="text-[#8d83ad]">RAM</span><div className="font-bold">{pkg.ram}</div></div>
                <div><span className="text-[#8d83ad]">CPU</span><div className="font-bold">{pkg.cpu}</div></div>
                <div><span className="text-[#8d83ad]">Storage</span><div className="font-bold">{pkg.storage}</div></div>
                <div><span className="text-[#8d83ad]">Max Bot</span><div className="font-bold">{pkg.maxBots}</div></div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#6f6690] mb-2">Fitur</p>
                <ul className="text-sm space-y-1 text-[#cdc3ea]">
                  {pkg.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>

              <ButtonLink href="/contact" className="mt-8 w-full" size="lg">
                Pesan Bot Hosting
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
