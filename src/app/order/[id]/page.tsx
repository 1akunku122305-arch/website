import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { read } from "@/lib/db";
import { formatIDR, SOFTWARES } from "@/lib/pricing";
import { PageHero } from "@/components/site/page-hero";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Konfirmasi Pesanan",
  description: "Ringkasan pesanan WangStore Anda dan langkah konfirmasi pembayaran.",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await read();
  const order = db.orders.find((o) => o.id === id);
  if (!order) notFound();

  const c = order.config;
  const region = db.regions.find((r) => r.id === c.region);
  const software = SOFTWARES.find((s) => s.id === c.software)?.label ?? String(c.software);
  const panel = "Pterodactyl";

  const rows: [string, string][] = [
    ["CPU", `${c.cpu} vCore`],
    ["RAM", `${c.ram} GB DDR5`],
    ["SSD", `${c.ssd} GB`],
    ["NVMe", c.nvme ? `${c.nvme} GB` : "—"],
    ["HDD", c.hdd ? `${c.hdd} GB` : "—"],
    ["Bandwidth", `${c.bandwidth} TB`],
    ["Region", `${region?.flag ?? ""} ${region?.name ?? c.region}`],
    ["Sistem Operasi", String(c.os)],
    ["Software", software],
    ["Versi Minecraft", String(c.mcVersion)],
    ["Java", String(c.java)],
    ["Panel", panel],
    ["Dedicated IP", c.dedicatedIp ? "Ya" : "Tidak"],
    ["Port tambahan", String(c.extraPorts)],
    ["Automatic backup", c.backup ? "Ya" : "Tidak"],
    ["Priority support", c.prioritySupport ? "Ya" : "Tidak"],
    ["Advanced DDoS", c.ddosAdvanced ? "Ya" : "Tidak"],
  ];

  return (
    <>
      <PageHero
        eyebrow="Pesanan Diterima"
        title="Terima kasih, pesanan Anda tercatat"
        description="Lanjutkan konfirmasi di WhatsApp agar tim kami dapat memverifikasi pembayaran dan memulai provisioning."
      />

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-[#c3ff3e]" strokeWidth={2.4} />
              <div>
                <p className="label">ID Pesanan</p>
                <p className="font-[family-name:var(--font-display)] text-xl font-black">{order.id}</p>
              </div>
            </div>
            <Badge tone="brand">{order.status}</Badge>
          </div>

          <p className="mt-4 text-xs text-[#8d83ad]">Dibuat {formatDateTime(order.createdAt)}</p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="label">Nama</dt>
              <dd className="text-sm font-bold">{order.customer.name}</dd>
            </div>
            <div>
              <dt className="label">Email</dt>
              <dd className="text-sm font-bold">{order.customer.email}</dd>
            </div>
            <div>
              <dt className="label">WhatsApp</dt>
              <dd className="text-sm font-bold">{order.customer.whatsapp}</dd>
            </div>
            <div>
              <dt className="label">Nama Server</dt>
              <dd className="text-sm font-bold">{order.serverName}</dd>
            </div>
          </dl>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k} className="border-b-2 border-[#241645]">
                    <th scope="row" className="py-2 text-left font-bold text-[#a99fc8]">
                      {k}
                    </th>
                    <td className="py-2 text-right font-bold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-2 border-t-2 border-[#241645] pt-5">
            <div className="flex justify-between text-sm text-[#a99fc8]">
              <span>Subtotal</span>
              <span className="font-bold text-[#cdc3ea]">{formatIDR(order.subtotal)}</span>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between text-sm text-[#c3ff3e]">
                <span>Kupon {order.coupon}</span>
                <span className="font-bold">-{formatIDR(order.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-[family-name:var(--font-display)] text-2xl font-black">
              <span>Total</span>
              <span className="text-[#c3ff3e]">{formatIDR(order.total)}</span>
            </div>
          </div>

          {order.notes ? (
            <div className="mt-6 rounded-xl border-2 border-[#3a2a63] bg-[#150f28] p-4">
              <p className="label">Catatan</p>
              <p className="mt-1 text-sm text-[#cdc3ea]">{order.notes}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${db.settings.social.whatsapp}?text=${encodeURIComponent(
                `Halo WangStore, saya ingin mengonfirmasi pesanan ${order.id} atas nama ${order.customer.name}.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed] px-7 py-4 text-base font-black uppercase tracking-wide text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_#000]"
            >
              <MessageCircle className="h-5 w-5" />
              Konfirmasi via WhatsApp
            </a>
            <ButtonLink href="/account" variant="secondary" size="lg">
              Lihat Riwayat Pesanan
            </ButtonLink>
          </div>
        </Card>
      </section>
    </>
  );
}
