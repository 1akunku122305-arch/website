import Link from "next/link";
import {
  Boxes,
  Cpu,
  Globe2,
  HardDrive,
  LifeBuoy,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Wrench,
} from "lucide-react";
import { read } from "@/lib/db";
import { Hero } from "@/components/site/hero";
import { Reveal } from "@/components/site/reveal";
import { Badge, ButtonLink, Card, SectionHeading } from "@/components/ui";
import { siteUrl } from "@/lib/content";

const SERVICES = [
  {
    icon: Boxes,
    title: "Minecraft Hosting",
    desc: "Paper, Purpur, Fabric, Forge, NeoForge, Vanilla, sampai proxy Velocity & Waterfall dengan panel siap pakai.",
    points: ["Instalasi satu klik", "Panel Pterodactyl/Reviactyl", "Pregenerator & backup harian"],
  },
  {
    icon: Terminal,
    title: "VPS",
    desc: "Root akses penuh di atas vCPU dedicated dan NVMe Gen4 untuk bot, web app, database, atau panel.",
    points: ["Ubuntu, Debian, Alma, Rocky, Windows", "Snapshot & rebuild instan", "IPv4 dedicated opsional"],
  },
  {
    icon: HardDrive,
    title: "Dedicated Server",
    desc: "Bare-metal Ryzen dan EPYC tanpa tetangga, dikonfigurasi sesuai beban kerja produksi Anda.",
    points: ["Hardware eksklusif", "IPMI & remote hands", "Uplink hingga 40 Gbps"],
  },
  {
    icon: Layers,
    title: "Panel Hosting",
    desc: "Pterodactyl atau Reviactyl terkelola penuh — kami yang urus update, database, dan wings node.",
    points: ["Multi-node siap skala", "SSL otomatis", "Monitoring 24/7"],
  },
];

const WHY = [
  { icon: Cpu, title: "CPU frekuensi tinggi", desc: "Ryzen 9 & EPYC dengan boost hingga 5,7 GHz — kunci TPS stabil untuk Minecraft." },
  { icon: ShieldCheck, title: "Proteksi berlapis", desc: "Scrubbing upstream, WAF edge, rate limiting Nginx, dan Fail2Ban aktif di semua node." },
  { icon: Globe2, title: "5 region global", desc: "Indonesia, Singapura, Jepang, Jerman, dan Amerika Serikat dengan rute latensi rendah." },
  { icon: Wrench, title: "Bebas racik", desc: "Tidak ada paket kaku. Bayar tepat sesuai core, RAM, dan storage yang Anda pakai." },
  { icon: LifeBuoy, title: "Support manusia 24/7", desc: "Tim teknis nyata di WhatsApp, Discord, dan tiket — rata-rata respons di bawah 10 menit." },
  { icon: Rocket, title: "Aktif dalam menit", desc: "Provisioning otomatis: server hidup rata-rata 3–10 menit setelah pembayaran terkonfirmasi." },
];

const STEPS = [
  { n: "01", title: "Racik spesifikasi", desc: "Atur CPU, RAM, storage, software, panel, dan region di Server Builder. Harga dan estimasi performa berubah realtime." },
  { n: "02", title: "Kirim detail", desc: "Isi nama, WhatsApp, email, nama server, dan kupon bila ada. Ringkasan pesanan tersusun otomatis." },
  { n: "03", title: "Konfirmasi via WhatsApp", desc: "Pesan pesanan terkirim rapi ke tim kami. Pilih metode bayar, konfirmasi, selesai." },
  { n: "04", title: "Main", desc: "Kredensial panel dikirim ke email. Undang pemain dan pantau performa dari dashboard." },
];

const MARQUEE = [
  "Paper", "Purpur", "Fabric", "Forge", "NeoForge", "Velocity", "Waterfall", "Pterodactyl", "Reviactyl",
  "NVMe Gen4", "DDR5 ECC", "Anti-DDoS", "Backup Harian", "Uptime 99.9%",
];

export default async function HomePage() {
  const db = await read();
  const s = db.settings;
  const testimonials = db.testimonials.slice(0, 3);
  const faqs = db.faqs.slice(0, 5);
  const posts = db.posts.filter((p) => p.published).slice(0, 3);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <Hero title={s.heroTitle} subtitle={s.heroSubtitle} badge={s.heroBadge} mascot={s.mascot} />

      <div className="overflow-hidden border-y-[3px] border-black bg-[#a855f7] py-3">
        <div className="marquee flex w-max gap-8 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-black uppercase tracking-widest text-black">
              {item} <Sparkles className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" id="layanan">
        <Reveal>
          <SectionHeading
            eyebrow="Layanan"
            title="Empat lini produk, satu standar performa"
            description="Semua layanan berjalan di atas hardware, jaringan, dan tim dukungan yang sama. Yang berbeda hanya seberapa dalam kontrol yang Anda inginkan."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.map((svc, i) => (
            <Reveal key={svc.title} delay={i * 0.06}>
              <Card className="brut-hover h-full">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed] shadow-[3px_3px_0_0_#000]">
                    <svc.icon className="h-6 w-6 text-white" strokeWidth={2.6} />
                  </span>
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-black">{svc.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#a99fc8]">{svc.desc}</p>
                    <ul className="mt-4 space-y-1.5">
                      {svc.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-[#cdc3ea]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#c3ff3e]" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="border-y-[3px] border-black bg-[#0b0718] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Kenapa WangStore"
              title="Dibangun oleh orang yang benar-benar menjalankan server"
              description="Setiap keputusan hardware dan jaringan kami ambil dari pengalaman menjaga komunitas tetap online di jam sibuk."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <Card className="brut-hover h-full">
                  <item.icon className="h-8 w-8 text-[#c3ff3e]" strokeWidth={2.4} />
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#a99fc8]">{item.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="mt-10 text-center">
              <ButtonLink href="/why-wangstore" variant="secondary">
                Baca perbandingan lengkap
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Regions */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Jaringan"
            title="Pilih region terdekat dengan pemain Anda"
            description="Latensi rata-rata diukur dari Jakarta ke masing-masing lokasi menggunakan probe internal WangStore."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {db.regions.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.05}>
              <Card className="brut-hover h-full text-center">
                <span className="text-4xl" aria-hidden>{r.flag}</span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-black">{r.name}</h3>
                <p className="text-xs text-[#8d83ad]">{r.city}</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-black text-[#c3ff3e]">
                  {r.latencyMs} ms
                </p>
                <p className="text-[11px] uppercase tracking-widest text-[#8d83ad]">dari Jakarta</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y-[3px] border-black bg-[#0b0718] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading eyebrow="Alur Pemesanan" title="Dari ide ke server online dalam empat langkah" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.07}>
                <Card className="h-full">
                  <span className="font-[family-name:var(--font-display)] text-4xl font-black text-[#3a2a63]">
                    {step.n}
                  </span>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-black">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#a99fc8]">{step.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Testimoni" title="Dipercaya komunitas dan developer Indonesia" />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <Card className="brut-hover h-full">
                <div className="flex gap-1" aria-label={`${t.rating} dari 5 bintang`}>
                  {Array.from({ length: 5 }, (_, n) => (
                    <Star
                      key={n}
                      className={n < t.rating ? "h-4 w-4 fill-[#c3ff3e] text-[#c3ff3e]" : "h-4 w-4 text-[#3a2a63]"}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#cdc3ea]">&ldquo;{t.body}&rdquo;</p>
                <p className="mt-5 font-black">{t.name}</p>
                <p className="text-xs text-[#8d83ad]">{t.role}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <ButtonLink href="/testimonials" variant="secondary">
              Lihat semua testimoni
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* Blog */}
      <section className="border-y-[3px] border-black bg-[#0b0718] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading eyebrow="Blog" title="Panduan teknis dari tim WangStore" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <Card as="article" className="brut-hover h-full">
                  <Badge tone="muted">{p.category}</Badge>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-black leading-snug">
                    <Link href={`/blog/${p.slug}`} className="hover:text-[#c3ff3e]">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#a99fc8]">{p.excerpt}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Pertanyaan yang paling sering masuk" />
        </Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.04}>
              <details className="brut-sm group bg-[#150f28] p-5">
                <summary className="cursor-pointer list-none font-black marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.question}
                    <span className="text-[#c3ff3e] transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#a99fc8]">{f.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-8 text-center">
            <ButtonLink href="/faq" variant="secondary">
              Semua pertanyaan
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="px-4 pb-8 sm:px-6">
        <Reveal>
          <div className="brut relative mx-auto max-w-5xl overflow-hidden bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#d946ef] p-10 text-center glow sm:p-14">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-black leading-tight sm:text-5xl">
              Siap membangun server Anda sendiri?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              Mulai dari 2 core, 4 GB RAM, dan 20 GB SSD seharga Rp45.000 per bulan. Naikkan kapan saja tanpa migrasi manual.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/builder" size="lg" variant="lime">
                Buka Server Builder
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="secondary">
                Konsultasi Gratis
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <link rel="canonical" href={siteUrl("/")} />
    </>
  );
}
