export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, HardDrive, Network, MapPin, Globe, Check, Ban } from 'lucide-react';
import { getDatastore } from '@/lib/db';
import { formatRupiah } from '@/lib/utils';
import { Badge, EmptyState, Alert } from '@/components/ui/display';
import type { VpsPackage, VpsLocation } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Paket VPS',
  description: 'Katalog paket VPS WangStore. Semua paket dikelola dari database.',
};

const billingLabel: Record<string, string> = {
  monthly: '/bulan',
  quarterly: '/3 bulan',
  semi_annual: '/6 bulan',
  annual: '/tahun',
};

export default async function VpsPage() {
  const store = await getDatastore();
  const [packages, locations] = await Promise.all([
    store.list<VpsPackage>('vpsPackages').catch(() => []),
    store.list<VpsLocation>('vpsLocations').catch(() => []),
  ]);
  const visible = packages.filter((p) => p.visibility === 'public' && !p.deleted && p.status !== 'inactive');
  const locMap = new Map(locations.map((l) => [l.id, l]));

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Paket VPS</h1>
      <p className="mt-2 max-w-2xl text-neutral-500 dark:text-neutral-400">
        Katalog paket VPS dengan spesifikasi tetap. Paket dikelola dari database oleh tim WangStore.
      </p>

      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Belum ada paket VPS tersedia"
            description="Paket VPS sedang disiapkan. Silakan kembali lagi nanti."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
            const loc = p.locationId ? locMap.get(p.locationId) : null;
            const soldOut = p.status === 'sold_out';
            const maintenance = p.status === 'maintenance';
            return (
              <div key={p.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  {p.status === 'available' && <Badge variant="success">Tersedia</Badge>}
                  {soldOut && <Badge variant="error">Habis</Badge>}
                  {maintenance && <Badge variant="warning">Maintenance</Badge>}
                </div>
                <p className="mt-2 text-2xl font-bold">{formatRupiah(p.price)}</p>
                <p className="text-xs text-neutral-400">{billingLabel[p.billingPeriod] ?? '/bulan'}</p>

                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Cpu className="h-4 w-4 text-neutral-400" /> {p.cpu} vCore</li>
                  <li className="flex items-center gap-2"><span className="font-medium">RAM</span> {p.ram} GB</li>
                  <li className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-neutral-400" /> {p.storage} GB</li>
                  <li className="flex items-center gap-2"><Network className="h-4 w-4 text-neutral-400" /> {p.bandwidth} GB</li>
                  <li className="flex items-center gap-2">
                    {p.ipv4 ? <Check className="h-4 w-4 text-green-500" /> : <Ban className="h-4 w-4 text-neutral-400" />} IPv4 {p.ipv4 ? 'tersedia' : 'tidak'}
                  </li>
                  {loc && (
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-neutral-400" /> {loc.city}, {loc.country}
                    </li>
                  )}
                </ul>

                {p.virtualization && <p className="mt-2 text-xs text-neutral-400">{p.virtualization}</p>}

                {p.description && <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{p.description}</p>}

                <div className="mt-auto pt-4">
                  {p.renewable ? <p className="mb-2 text-xs text-neutral-400">Dapat diperpanjang</p> : <p className="mb-2 text-xs text-neutral-400">Tidak dapat diperpanjang</p>}
                  <Link href="/contact" className="btn btn-secondary w-full" aria-disabled={!p.renewable}>
                    Tanyakan Ketersediaan
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Alert variant="info" title="Catatan">
          Paket VPS dikelola dari database dan dapat berubah sewaktu-waktu. Harga dan spesifikasi diverifikasi oleh tim WangStore.
        </Alert>
      </div>
    </div>
  );
}
