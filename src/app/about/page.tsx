import type { Metadata } from "next";
import { Compass, Cpu, HeartHandshake, Rocket, Users } from "lucide-react";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge, ButtonLink, Card, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang WangStore",
  description:
    "Cerita, visi, misi, tim, dan teknologi di balik WangStore — platform hosting Minecraft, VPS, dedicated server, dan panel hosting Indonesia.",
  alternates: { canonical: siteUrl("/about") },
  openGraph: { title: "Tentang WangStore", url: siteUrl("/about") },
};

const REASONS = [
  { icon: Rocket, title: "Performa terukur", desc: "Kami publikasikan estimasi TPS dan kapasitas pemain sebelum Anda membayar, bukan janji kosong." },
  { icon: HeartHandshake, title: "Dukungan nyata", desc: "Tim teknis, bukan bot. Rata-rata respons di bawah 10 menit sepanjang hari." },
  { icon: Cpu, title: "Hardware terbaru", desc: "Ryzen 9 dan EPYC generasi terkini dengan NVMe Gen4 dan DDR5 ECC." },
  { icon: Compass, title: "Transparansi penuh", desc: "Status node, riwayat insiden, dan kredit SLA terbuka untuk semua pelanggan." },
];

export default async function AboutPage() {
  const db = await read();
  const about = db.settings.about;

  return (
    <>
      <PageHero
        eyebrow="Tentang Kami"
        title="Infrastruktur yang lahir dari komunitas"
        description="WangStore dibangun oleh operator server yang bosan menjelaskan lag kepada pemainnya sendiri."
      >
        <ButtonLink href="/builder">Racik Server</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Hubungi Tim
        </ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Cerita Kami" title="Dari satu node di Jakarta" align="left" />
          <p className="mt-6 text-base leading-relaxed text-[#a99fc8]">{about.story}</p>
        </Reveal>
      </section>

      <section className="border-y-[3px] border-black bg-[#0b0718] px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <Reveal>
            <Card className="h-full">
              <Badge tone="cyan">Visi</Badge>
              <p className="mt-4 text-lg font-bold leading-relaxed text-[#f5f2ff]">{about.vision}</p>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card className="h-full">
              <Badge tone="lime">Misi</Badge>
              <ul className="mt-4 space-y-3">
                {about.mission.map((m) => (
                  <li key={m} className="flex gap-3 text-sm leading-relaxed text-[#cdc3ea]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c3ff3e]" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Kenapa Kami" title="Empat alasan pelanggan bertahan" />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.05}>
              <Card className="brut-hover h-full">
                <r.icon className="h-7 w-7 text-[#c3ff3e]" strokeWidth={2.4} />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-black">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a99fc8]">{r.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y-[3px] border-black bg-[#0b0718] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Infrastruktur"
              title="Enam node produksi di lima negara"
              description="Setiap node dipantau Prometheus dan Grafana dengan alerting ke tim on-call 24 jam."
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {db.nodes.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.04}>
                <Card className="h-full">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-[family-name:var(--font-display)] text-base font-black">{n.name}</h3>
                    <Badge tone={n.status === "OPERATIONAL" ? "lime" : "muted"}>{n.uptime30d}%</Badge>
                  </div>
                  <dl className="mt-4 space-y-1.5 text-xs text-[#a99fc8]">
                    <div className="flex justify-between gap-3">
                      <dt>CPU</dt>
                      <dd className="text-right font-bold text-[#cdc3ea]">{n.cpu}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>RAM</dt>
                      <dd className="text-right font-bold text-[#cdc3ea]">{n.ram}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Storage</dt>
                      <dd className="text-right font-bold text-[#cdc3ea]">{n.storage}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Jaringan</dt>
                      <dd className="text-right font-bold text-[#cdc3ea]">{n.network}</dd>
                    </div>
                  </dl>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Tim" title="Orang di balik WangStore" />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.team.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05}>
              <Card className="brut-hover h-full text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed] shadow-[3px_3px_0_0_#000]">
                  <Users className="h-8 w-8 text-white" strokeWidth={2.4} />
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-black">{t.name}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">{t.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#a99fc8]">{t.bio}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t-[3px] border-black bg-[#0b0718] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading eyebrow="Teknologi" title="Tumpukan teknologi yang kami jalankan" />
          </Reveal>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {about.tech.map((t, i) => (
              <Reveal key={t} delay={i * 0.03}>
                <span className="chip bg-[#1b1233] text-[#cdc3ea]">{t}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
