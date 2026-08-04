import type { Metadata } from "next";
import { BadgeCheck, Banknote, Headphones, Timer, TrendingUp, Wrench } from "lucide-react";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Card, SectionHeading, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kenapa WangStore",
  description:
    "Alasan komunitas Minecraft, kreator, dan developer Indonesia memilih WangStore: performa terukur, harga jujur, dan dukungan manusia 24/7.",
  alternates: { canonical: siteUrl("/why-wangstore") },
  openGraph: { title: "Kenapa WangStore", url: siteUrl("/why-wangstore") },
};

const PILLARS = [
  {
    icon: TrendingUp,
    title: "Performa yang bisa diverifikasi",
    body: "Kami menampilkan estimasi TPS, kapasitas pemain, beban CPU, dan pemakaian RAM langsung di Server Builder sebelum Anda membayar sepeser pun. Setelah aktif, angka nyata dapat Anda bandingkan dari panel dan Grafana.",
  },
  {
    icon: Banknote,
    title: "Harga yang jujur",
    body: "Tidak ada biaya tersembunyi, tidak ada paket yang memaksa Anda membeli RAM berlebih hanya untuk mendapat core tambahan. Setiap komponen dihitung terpisah dan rinciannya terbuka pada ringkasan pesanan.",
  },
  {
    icon: Wrench,
    title: "Fleksibilitas tanpa migrasi",
    body: "Upgrade core, RAM, atau storage dihitung prorata dan diterapkan dengan satu restart singkat. Anda tidak perlu memindahkan dunia atau mengonfigurasi ulang plugin.",
  },
  {
    icon: Headphones,
    title: "Dukungan yang benar-benar teknis",
    body: "Tiket dijawab oleh engineer yang bisa membaca timings report, bukan template balasan. Rata-rata respons pertama di bawah 10 menit sepanjang hari.",
  },
  {
    icon: Timer,
    title: "Aktivasi cepat",
    body: "Provisioning otomatis membuat server Minecraft dan VPS hidup rata-rata dalam 3–10 menit setelah pembayaran terkonfirmasi.",
  },
  {
    icon: BadgeCheck,
    title: "Transparansi insiden",
    body: "Setiap gangguan dicatat lengkap dengan kronologi di halaman Status, dan kredit SLA diberikan tanpa Anda harus menagih.",
  },
];

export default async function WhyPage() {
  const db = await read();
  const avg = Math.round((db.nodes.reduce((s, n) => s + n.uptime30d, 0) / db.nodes.length) * 100) / 100;

  return (
    <>
      <PageHero
        eyebrow="Kenapa WangStore"
        title="Enam alasan pelanggan tidak pindah lagi"
        description="Bukan karena kami paling murah, tetapi karena angka, harga, dan janji kami bisa diperiksa."
      >
        <ButtonLink href="/builder">Racik Server</ButtonLink>
        <ButtonLink href="/testimonials" variant="secondary">
          Baca Testimoni
        </ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Uptime 30 hari" value={`${avg}%`} sub="rata-rata armada" />
          <Stat label="Respons pertama" value="< 10 mnt" sub="rata-rata tiket" />
          <Stat label="Region" value="5" sub="ID, SG, JP, DE, US" />
          <Stat label="Mulai dari" value="Rp45rb" sub="per bulan" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <Card className="brut-hover h-full">
                <p.icon className="h-8 w-8 text-[#c3ff3e]" strokeWidth={2.4} />
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-black">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#a99fc8]">{p.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t-[3px] border-black bg-[#0b0718] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionHeading
              eyebrow="Jaminan"
              title="Coba 7 hari, tidak cocok uang kembali"
              description="Berlaku untuk layanan Minecraft Hosting dan VPS baru sesuai ketentuan pada halaman Refund Policy."
            />
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/builder">Mulai Sekarang</ButtonLink>
              <ButtonLink href="/legal/refund" variant="secondary">
                Baca Ketentuan
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
