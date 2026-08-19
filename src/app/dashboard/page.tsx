export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth/session';
import { getDatastore } from '@/lib/db';
import { StatCard, EmptyState } from '@/components/ui/display';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { resolveServiceStatus, remainingDays } from '@/lib/services';
import type { Order, ServiceInstance, Ticket, Notification, User } from '@/lib/types';
import { Badge } from '@/components/ui/display';

export default async function DashboardHome() {
  const session = await getSession();
  if (!session) return null; // layout redirects to /login
  const store = await getDatastore();
  const userId = session.sub;

  const [orders, services, tickets, notifications, user] = await Promise.all([
    store.list<Order>('orders'),
    store.list<ServiceInstance>('serviceInstances'),
    store.list<Ticket>('tickets'),
    store.list<Notification>('notifications'),
    store.get<User>('users', userId),
  ]);

  const myOrders = orders.filter((o) => o.customerId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myServices = services.filter((s) => s.customerId === userId);
  const myTickets = tickets.filter((t) => t.customerId === userId);
  const myNotifs = notifications.filter((n) => n.userId === userId);
  const unreadNotifs = myNotifs.filter((n) => !n.read).length;

  const activeServices = myServices.filter((s) => {
    const w = resolveServiceStatus(s);
    return w.status === 'active' || w.status === 'scheduled';
  }).length;

  return (
    <div>
      <h1 className="text-2xl font-bold">Ringkasan</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Selamat datang, {user?.name}. Kelola pesanan, layanan, dan tiket Anda di sini.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pesanan" value={myOrders.length} />
        <StatCard label="Layanan Aktif" value={activeServices} />
        <StatCard label="Tiket" value={myTickets.length} />
        <StatCard label="Notifikasi Belum Dibaca" value={unreadNotifs} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Pesanan Terbaru</h2>
        {myOrders.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Belum ada pesanan" description="Buat order melalui Server Builder." />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-neutral-100 dark:border-neutral-800">
                    <td className="px-4 py-2">{o.id}</td>
                    <td className="px-4 py-2">{formatDateTime(o.createdAt)}</td>
                    <td className="px-4 py-2">{formatRupiah(o.total)}</td>
                    <td className="px-4 py-2"><Badge variant="info">{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Layanan Saya</h2>
        {myServices.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Belum ada layanan" description="Layanan dibuat setelah pesanan dikonfirmasi." />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {myServices.slice(0, 5).map((s) => {
              const w = resolveServiceStatus(s);
              return (
                <div key={s.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{s.id}</p>
                    <Badge variant={w.status === 'active' ? 'success' : w.status === 'scheduled' ? 'info' : 'neutral'}>{w.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Aktif hingga {formatDateTime(s.expiresAt)} · Sisa {remainingDays(s)} hari
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
