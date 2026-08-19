export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { getDatastore } from '@/lib/db';
import { getWhatsappNumber, buildOrderWhatsappMessage, whatsappLink } from '@/lib/whatsapp';
import { TIERS } from '@/lib/pricing/tiers';
import { getHighPackage } from '@/lib/pricing/packages';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { Card, CardContent, Badge, Alert } from '@/components/ui/display';
import { Breadcrumb } from '@/components/ui/navigation';
import type { Order } from '@/lib/types';

export const metadata: Metadata = { title: 'Konfirmasi Order', robots: { index: false } };

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const store = await getDatastore();
  const order = await store.get<Order>('orders', params.id);
  if (!order) notFound();

  const number = getWhatsappNumber();
  const message = buildOrderWhatsappMessage({
    order,
    tierLabel: TIERS[order.tier].label,
    packageLabel: order.packageId ? getHighPackage(order.packageId)?.label : undefined,
  });

  return (
    <div className="container-page py-12">
      <Breadcrumb items={[{ label: 'Order', href: '/server-builder' }, { label: order.id }]} />
      <h1 className="text-3xl font-bold">Konfirmasi Order</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">
        Order Anda telah tersimpan. Selesaikan pemesanan melalui WhatsApp.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{order.id}</h2>
              <Badge variant="info">{order.status}</Badge>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Row label="Nama" value={order.name} />
              <Row label="WhatsApp" value={order.whatsapp} />
              <Row label="Email" value={order.email} />
              <Row label="Nama Server" value={order.serverName} />
              <Row label="Tanggal" value={formatDateTime(order.createdAt)} />
              <Row label="Tier" value={TIERS[order.tier].label} />
              <Row label="CPU" value={`${order.cpu} vCore`} />
              <Row label="RAM" value={`${order.ram} GB`} />
              <Row label="Penyimpanan" value={`${order.storage} GB`} />
              <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
              {order.couponCode && <Row label="Kupon" value={order.couponCode} />}
              {order.discount > 0 && <Row label="Diskon" value={`-${formatRupiah(order.discount)}`} />}
              <Row label="Total" value={<span className="font-semibold">{formatRupiah(order.total)}/bulan</span>} />
            </dl>
            {order.note && <p className="text-sm text-neutral-500">Catatan: {order.note}</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {number ? (
            <a
              href={whatsappLink(number, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full"
            >
              <MessageCircle className="h-4 w-4" /> Lanjutkan via WhatsApp
            </a>
          ) : (
            <Alert variant="warning">
              WhatsApp belum dikonfigurasi. Hubungi tim WangStore melalui kanal yang tersedia.
            </Alert>
          )}

          <Alert variant="warning" title="Peringatan Pembelian">
            <p className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Pembelian bersifat final sesuai kebijakan WangStore. Pastikan konfigurasi Anda sudah benar.
            </p>
          </Alert>

          <Card>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">Kebijakan Terkait</p>
              <ul className="space-y-1 text-neutral-600 dark:text-neutral-300">
                <li><Link href="/terms" className="underline">Syarat &amp; Ketentuan</Link></li>
                <li><Link href="/refund" className="underline">Kebijakan Pengembalian Dana</Link></li>
                <li><Link href="/sla" className="underline">Service Level Agreement</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
