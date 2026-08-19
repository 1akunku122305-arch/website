export const dynamic = 'force-dynamic';
import { getDatastore } from '@/lib/db';
import { Card, CardContent, Badge, EmptyState } from '@/components/ui/display';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import type { User, Profile, Order } from '@/lib/types';

export default async function AdminCustomersPage() {
  const store = await getDatastore();
  const [users, profiles, orders] = await Promise.all([
    store.list<User>('users'), store.list<Profile>('profiles'), store.list<Order>('orders'),
  ]);
  const customers = users
    .filter((u) => u.role === 'customer')
    .map((u) => {
      const profile = profiles.find((p) => p.userId === u.id);
      const o = orders.filter((x) => x.customerId === u.id);
      return { ...u, whatsapp: profile?.whatsapp ?? '', orderCount: o.length, total: o.reduce((s, x) => s + x.total, 0) };
    });

  return (
    <div>
      <h1 className="text-2xl font-bold">Pelanggan</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Daftar akun pelanggan.</p>
      {customers.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada pelanggan" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {customers.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-neutral-400">{c.email} · terdaftar {formatDateTime(c.createdAt)}</p>
                  </div>
                  <Badge variant={c.emailVerified ? 'success' : 'warning'}>{c.emailVerified ? 'Terverifikasi' : 'Belum verifikasi'}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500">
                  <span>WhatsApp: {c.whatsapp || '—'}</span>
                  <span>Order: {c.orderCount}</span>
                  <span>Total: {formatRupiah(c.total)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
