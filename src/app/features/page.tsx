import type { Metadata } from "next";
import {
  Archive,
  BellRing,
  Blocks,
  Clock,
  Cpu,
  Gauge,
  Globe2,
  KeyRound,
  LifeBuoy,
  Network,
  Puzzle,
  ShieldCheck,
  Sliders,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Card, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Fitur",
  description:
    "Semua fitur WangStore: konfigurasi bebas, panel Pterodactyl/Reviactyl, backup otomatis, anti-DDoS, monitoring, dukungan 24/7, dan banyak lagi.",
  alternates: { canonical: siteUrl("/features") },
  openGraph: { title: "Fitur WangStore", url: siteUrl("/features") },
};

const GROUPS = [
  {
    title: "Kontrol Penuh",
    items: [
      { icon: Sliders, title: "Konfigurasi bebas", desc: "Atur core, RAM, dan tiga tier storage secara terpisah — bayar tepat yang dipakai." },
      { icon: Blocks, title: "Delapan software server", desc: "Paper, Purpur, Fabric, Forge, NeoForge, Vanilla, Velocity, dan Waterfall siap satu klik." },
      { icon: Terminal, title: "Akses root & SFTP", desc: "SSH penuh pada VPS, SFTP dan konsol web pada seluruh instance game." },
      { icon: Puzzle, title: "Panel pilihan Anda", desc: "Pterodactyl, Reviactyl, atau tanpa panel sama sekali." },
    ],
  },
  {
    title: "Performa",
    items: [
      { icon: Cpu, title: "CPU frekuensi tinggi", desc: "Boost hingga 5,7 GHz — faktor utama TPS stabil di server ramai." },
      { icon: Gauge, title: "Estimasi kapasitas transparan", desc: "TPS, jumlah pemain, beban CPU/RAM, dan rekomendasi plugin ditampilkan sebelum membeli." },
      { icon: Network, title: "NVMe Gen4 RAID-10", desc: "Chunk loading dan restart dunia besar terasa instan." },
      { icon: Globe2, title: "Lima region", desc: "Indonesia, Singapura, Jepang, Jerman, dan Amerika Serikat." },
    ],
  },
  {
    title: "Keamanan & Keandalan",
    items: [
      { icon: ShieldCheck, title: "Anti-DDoS berlapis", desc: "Scrubbing upstream, WAF edge, rate limiting, dan Fail2Ban." },
      { icon: Archive, title: "Backup otomatis", desc: "Snapshot harian terenkripsi dengan retensi 7 hari off-site." },
      { icon: KeyRound, title: "Akses berbasis peran", desc: "Owner, Admin, dan Staff dengan audit log setiap tindakan." },
      { icon: Clock, title: "SLA 99,9%", desc: "Kredit layanan otomatis bila target uptime bulanan tidak tercapai." },
    ],
  },
  {
    title: "Dukungan & Komunitas",
    items: [
      { icon: LifeBuoy, title: "Support 24/7", desc: "WhatsApp, Discord, dan sistem tiket dengan SLA respons jelas." },
      { icon: Users, title: "Komunitas aktif", desc: "Grup WhatsApp dan Discord berisi operator server lain untuk berbagi konfigurasi." },
      { icon: BellRing, title: "Notifikasi insiden", desc: "Pemberitahuan pemeliharaan dan gangguan dikirim sebelum berdampak." },
      { icon: Zap, title: "Migrasi dibantu", desc: "Tim kami memindahkan dunia, plugin, dan database dari penyedia lama tanpa biaya." },
    ],
  },
];

const COMPARISON = [
  ["Konfigurasi bebas tanpa paket", "Ya", "Terbatas paket"],
  ["Estimasi TPS sebelum beli", "Ya", "Tidak"],
  ["Panel Pterodactyl & Reviactyl", "Keduanya", "Satu pilihan"],
  ["Backup harian terenkripsi", "Add-on Rp15.000", "Sering berbayar mahal"],
  ["Kredit SLA otomatis", "Ya", "Harus klaim manual"],
  ["Region Indonesia latensi 6 ms", "Ya", "Umumnya Singapura"],
  ["Dukungan Bahasa Indonesia 24/7", "Ya", "Jam kerja"],
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Fitur"
        title="Semua yang dibutuhkan operator server serius"
        description="Dari kontrol teknis mendalam sampai dukungan manusia yang benar-benar menjawab, semuanya sudah termasuk."
      >
        <ButtonLink href="/builder">Mulai Racik</ButtonLink>
        <ButtonLink href="/why-wangstore" variant="secondary">
          Bandingkan
        </ButtonLink>
      </PageHero>

      {GROUPS.map((group, gi) => (
        <section
          key={group.title}
          className={gi % 2 === 1 ? "border-y-[3px] border-black bg-[#0b0718] px-4 py-16 sm:px-6" : "px-4 py-16 sm:px-6"}
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading eyebrow={`0${gi + 1}`} title={group.title} />
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {group.items.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.05}>
                  <Card className="brut-hover h-full">
                    <item.icon className="h-7 w-7 text-[#c3ff3e]" strokeWidth={2.4} />
                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#a99fc8]">{item.desc}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Perbandingan" title="WangStore vs penyedia umum" />
        </Reveal>
        <Reveal delay={0.06}>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b-[3px] border-black bg-[#1b1233] text-left">
                  <th className="p-3 font-black">Kemampuan</th>
                  <th className="p-3 font-black text-[#c3ff3e]">WangStore</th>
                  <th className="p-3 font-black text-[#a99fc8]">Penyedia umum</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([feature, us, them]) => (
                  <tr key={feature} className="border-b-2 border-[#241645]">
                    <td className="p-3 font-bold">{feature}</td>
                    <td className="p-3 font-bold text-[#c3ff3e]">{us}</td>
                    <td className="p-3 text-[#a99fc8]">{them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>
    </>
  );
}
