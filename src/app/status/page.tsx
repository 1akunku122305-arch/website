import type { Metadata } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { StatusBoard } from "@/components/site/status-board";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status Sistem",
  description: "Uptime node, status region, pemeliharaan terjadwal, dan riwayat insiden WangStore secara transparan.",
  alternates: { canonical: siteUrl("/status") },
  openGraph: { title: "Status Sistem WangStore", url: siteUrl("/status") },
};

export default async function StatusPage() {
  const db = await read();
  const overall = db.nodes.some((n) => n.status === "DOWN")
    ? "MAJOR_OUTAGE"
    : db.nodes.some((n) => n.status === "DEGRADED")
      ? "DEGRADED"
      : db.nodes.some((n) => n.status === "MAINTENANCE")
        ? "MAINTENANCE"
        : "OPERATIONAL";

  const initial = {
    overall,
    operational: db.nodes.filter((n) => n.status === "OPERATIONAL").length,
    total: db.nodes.length,
    averageUptime: Math.round((db.nodes.reduce((s, n) => s + n.uptime30d, 0) / db.nodes.length) * 100) / 100,
    nodes: db.nodes,
    incidents: db.incidents,
    checkedAt: new Date().toISOString(),
  };

  return (
    <>
      <PageHero
        eyebrow="Status"
        title="Transparansi tanpa filter"
        description="Halaman ini menampilkan kondisi nyata armada kami, termasuk saat sedang tidak sempurna."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <StatusBoard initial={initial} />
      </section>
    </>
  );
}
