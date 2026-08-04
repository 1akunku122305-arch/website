import type { Metadata } from "next";
import { Activity, Cable, Database, Lock, Server, ShieldCheck } from "lucide-react";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge, ButtonLink, Card, SectionHeading, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Infrastruktur",
  description:
    "Hardware, jaringan, keamanan, dan observability WangStore: Ryzen 9 & EPYC, NVMe Gen4 RAID-10, uplink hingga 40 Gbps ter-filter di lima region.",
  alternates: { canonical: siteUrl("/infrastructure") },
  openGraph: { title: "Infrastruktur WangStore", url: siteUrl("/infrastructure") },
};

const PILLARS = [
  {
    icon: Server,
    title: "Compute",
    items: [
      "AMD Ryzen 9 7950X / 7950X3D untuk beban single-thread Minecraft",
      "AMD EPYC Genoa untuk node densitas tinggi dan VPS",
      "DDR5 ECC 128–256 GB per node",
      "Rasio overcommit CPU dijaga maksimal 1:3, RAM tanpa overcommit",
    ],
  },
  {
    icon: Database,
    title: "Storage",
    items: [
      "NVMe Gen4 enterprise dalam RAID-10 (redundansi + IOPS)",
      "SSD SATA enterprise untuk tier ekonomis",
      "HDD 7200 RPM untuk arsip dan backup dingin",
      "Snapshot harian terenkripsi AES-256 ke lokasi terpisah",
    ],
  },
  {
    icon: Cable,
    title: "Jaringan",
    items: [
      "Uplink 10–40 Gbps per node dengan multi-transit",
      "Peering langsung ke IIX/JKT-IX untuk trafik domestik",
      "Anycast DNS dengan failover otomatis",
      "Rute latensi rendah Jakarta–Singapura–Tokyo",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Proteksi",
    items: [
      "Scrubbing volumetrik upstream L3/L4",
      "WAF edge dengan managed ruleset dan bot scoring",
      "Rate limiting Nginx pada endpoint sensitif",
      "Fail2Ban realtime terhadap brute force dan port scanning",
    ],
  },
  {
    icon: Activity,
    title: "Observability",
    items: [
      "Prometheus node exporter di seluruh armada",
      "Dashboard Grafana per node dan per region",
      "Alerting on-call 24/7 melalui multi-channel",
      "Status publik dan riwayat insiden terbuka",
    ],
  },
  {
    icon: Lock,
    title: "Kepatuhan & Akses",
    items: [
      "Data center bersertifikasi ISO 27001 dan Tier III",
      "Akses fisik terbatas dengan biometrik dan CCTV",
      "Kontrol akses berbasis peran untuk seluruh staf",
      "Audit log immutable untuk setiap tindakan administratif",
    ],
  },
];

export default async function InfrastructurePage() {
  const db = await read();
  const avg = Math.round((db.nodes.reduce((s, n) => s + n.uptime30d, 0) / db.nodes.length) * 100) / 100;

  return (
    <>
      <PageHero
        eyebrow="Infrastruktur"
        title="Hardware cepat, jaringan bersih, pengawasan tanpa henti"
        description="Setiap lapisan dirancang untuk satu tujuan: menjaga TPS tetap 20 dan layanan tetap online saat jam sibuk."
      >
        <ButtonLink href="/status" variant="secondary">
          Lihat Status Realtime
        </ButtonLink>
        <ButtonLink href="/builder">Racik Server</ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Node produksi" value={String(db.nodes.length)} sub="lima region" />
          <Stat label="Uptime rata-rata" value={`${avg}%`} sub="30 hari terakhir" />
          <Stat label="Kapasitas uplink" value="40 Gbps" sub="per node tertinggi" />
          <Stat label="Latensi terendah" value="6 ms" sub="Jakarta" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <Card className="brut-hover h-full">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed] shadow-[3px_3px_0_0_#000]">
                  <p.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </span>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-black">{p.title}</h2>
                <ul className="mt-4 space-y-2">
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-[#a99fc8]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c3ff3e]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y-[3px] border-black bg-[#0b0718] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading eyebrow="Armada" title="Spesifikasi setiap node" />
          </Reveal>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b-[3px] border-black bg-[#1b1233] text-left">
                  <th className="p-3 font-black">Node</th>
                  <th className="p-3 font-black">Region</th>
                  <th className="p-3 font-black">CPU</th>
                  <th className="p-3 font-black">RAM</th>
                  <th className="p-3 font-black">Storage</th>
                  <th className="p-3 font-black">Jaringan</th>
                  <th className="p-3 font-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {db.nodes.map((n) => (
                  <tr key={n.id} className="border-b-2 border-[#241645]">
                    <td className="p-3 font-bold">{n.name}</td>
                    <td className="p-3 text-[#a99fc8]">{n.region}</td>
                    <td className="p-3 text-[#a99fc8]">{n.cpu}</td>
                    <td className="p-3 text-[#a99fc8]">{n.ram}</td>
                    <td className="p-3 text-[#a99fc8]">{n.storage}</td>
                    <td className="p-3 text-[#a99fc8]">{n.network}</td>
                    <td className="p-3">
                      <Badge tone={n.status === "OPERATIONAL" ? "lime" : n.status === "MAINTENANCE" ? "cyan" : "danger"}>
                        {n.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Reveal>
          <Card>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-black">Catatan jujur soal DDoS</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#a99fc8]">
              Mitigasi DDoS bergantung pada kapasitas transit dan kerja sama penyedia hulu — tidak ada skrip, firewall,
              atau konfigurasi yang bisa menjamin kekebalan mutlak. Yang kami sediakan adalah kapasitas scrubbing terukur,
              aturan filter yang terus diperbarui, transparansi insiden, dan kredit SLA bila target uptime tidak tercapai.
              Seluruh konfigurasi Nginx, Cloudflare, dan Fail2Ban yang kami gunakan tersedia di repositori (
              <code>nginx/</code> dan <code>docs/SECURITY.md</code>) agar dapat Anda audit sendiri.
            </p>
          </Card>
        </Reveal>
      </section>
    </>
  );
}
