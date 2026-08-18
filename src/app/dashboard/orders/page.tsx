import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getDatastore } from '@/lib/db';
import { EmptyState, Badge, Card, CardContent } from '@/components/ui/display';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import type { Order } from '@/lib/types';

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) return null; // layout redirects to /login
  const store = await getDatastore();
  const orders = (await store.list<Order>('orders'))
    .filter((o) => o.customerId === session.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Pesanan</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Riwayat pesanan Anda.</p>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Belum ada pesanan" description="Buat order melalui Server Builder." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/order/${o.id}`} className="font-medium hover:underline">
                      {o.id}
                    </Link>
                    <p className="text-xs text-neutral-400">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <Badge variant="info">{o.status}</Badge>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <Detail label="Layanan" value={`${o.tier} · ${o.cpu} vCore · ${o.ram} GB · ${o.storage} GB`} />
                  <Detail label="Total" value={formatRupiah(o.total)} />
                  {o.couponCode && <Detail label="Kupon" value={o.couponCode} />}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
