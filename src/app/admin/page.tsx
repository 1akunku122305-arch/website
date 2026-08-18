import { getSession } from '@/lib/auth/session';
import { getDatastore } from '@/lib/db';
import { StatCard } from '@/components/ui/display';
import { hasPermission } from '@/lib/auth/rbac';
import { formatRupiah } from '@/lib/utils';
import type { Order, User } from '@/lib/types';

function startOfToday() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString();
}
function startOfMonth() {
  const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.toISOString();
}

export default async function AdminHome() {
  const session = await getSession();
  const store = await getDatastore();
  const [orders, users] = await Promise.all([store.list<Order>('orders'), store.list<User>('users')]);

  const todayStart = startOfToday();
  const monthStart = startOfMonth();
  const confirmed = orders.filter((o) => ['paid', 'processing', 'completed'].includes(o.status));

  const stats = [
    { label: 'Total Order', value: orders.length },
    { label: 'Order Hari Ini', value: orders.filter((o) => o.createdAt >= todayStart).length },
    { label: 'Order Bulan Ini', value: orders.filter((o) => o.createdAt >= monthStart).length },
    { label: 'Pendapatan (Terkonfirmasi)', value: formatRupiah(confirmed.reduce((s, o) => s + o.total, 0)) },
    { label: 'Pelanggan', value: users.filter((u) => u.role === 'customer').length },
    { label: 'Pending Order', value: orders.filter((o) => o.status === 'awaiting_payment').length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Ringkasan Admin</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Login sebagai {session?.role}. Gunakan menu samping untuk mengelola.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} />)}
      </div>
      {!hasPermission(session!.role, 'analytics:read') && (
        <p className="mt-6 text-sm text-neutral-500">Anda memiliki akses terbatas (Staff). Lihat halaman Analitik untuk detail.</p>
      )}
    </div>
  );
}
