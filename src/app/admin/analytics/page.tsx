export const dynamic = 'force-dynamic';
import { getDatastore } from '@/lib/db';
import { StatCard, Card, CardContent, EmptyState } from '@/components/ui/display';
import { formatRupiah } from '@/lib/utils';
import type { Order, OrderItem } from '@/lib/types';

export default async function AdminAnalyticsPage() {
  const store = await getDatastore();
  const [orders, items] = await Promise.all([store.list<Order>('orders'), store.list<OrderItem>('orderItems')]);

  const confirmed = orders.filter((o) => ['paid', 'processing', 'completed'].includes(o.status));
  const monthStart = (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.toISOString(); })();

  const popularity = new Map<string, number>();
  for (const it of items) {
    const key = it.packageId ? it.tier + ':' + it.packageId : it.tier + `:${it.cpu}c${it.ram}g`;
    popularity.set(key, (popularity.get(key) ?? 0) + 1);
  }
  const popular = Array.from(popularity.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold">Analitik</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Berdasarkan data aktual. Tidak ada angka palsu.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Order" value={orders.length} />
        <StatCard label="Order Bulan Ini" value={orders.filter((o) => o.createdAt >= monthStart).length} />
        <StatCard label="Pendapatan (Terkonfirmasi)" value={formatRupiah(confirmed.reduce((s, o) => s + o.total, 0))} />
        <StatCard label="Pendapatan Bulan Ini" value={formatRupiah(confirmed.filter((o) => o.createdAt >= monthStart).reduce((s, o) => s + o.total, 0))} />
      </div>

      <Card className="mt-8">
        <CardContent>
          <h2 className="font-semibold">Paket Populer</h2>
          {popular.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">Belum ada data untuk periode ini.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm">
              {popular.map(([k, count]) => (
                <li key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{count} order</span></li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
