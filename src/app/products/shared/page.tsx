import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Card, ButtonLink, Badge } from "@/components/ui";
import { formatIDR } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Shared Hosting | WangStore",
  description: "Shared Hosting cepat dan terjangkau dengan SSD, SSL gratis, dan 1-click installer.",
  alternates: { canonical: siteUrl("/products/shared") },
};

export default async function SharedHostingPage() {
  const db = await read();

  return (
    <>
      <PageHero
        eyebrow="Shared Hosting"
        title="Shared Hosting Premium"
        description="Hosting cepat dengan SSD, SSL gratis, dan dukungan 24/7. Cocok untuk website bisnis, blog, atau portfolio."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {(db.sharedHosting || []).map((pkg) => (
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

              <ul className="mt-6 space-y-2 text-sm">
                <li className="flex justify-between"><span>Disk</span><span className="font-bold">{pkg.disk}</span></li>
                <li className="flex justify-between"><span>Bandwidth</span><span className="font-bold">{pkg.bandwidth}</span></li>
                <li className="flex justify-between"><span>Website</span><span className="font-bold">{pkg.websites}</span></li>
                <li className="flex justify-between"><span>Email</span><span className="font-bold">{pkg.email}</span></li>
                <li className="flex justify-between"><span>Database</span><span className="font-bold">{pkg.databases}</span></li>
              </ul>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#6f6690] mb-2">Fitur Utama</p>
                <ul className="text-sm space-y-1 text-[#cdc3ea]">
                  {pkg.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>

              <ButtonLink href="/contact" className="mt-8 w-full" size="lg">
                Pesan Sekarang
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
