export const dynamic = 'force-dynamic';
import { getDatastore } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, EmptyState, Badge } from '@/components/ui/display';
import { formatDateTime } from '@/lib/utils';
import type { Ticket, User } from '@/lib/types';

export default async function AdminTicketsPage() {
  const store = await getDatastore();
  const [tickets, users] = await Promise.all([store.list<Ticket>('tickets'), store.list<User>('users')]);
  const sorted = tickets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Tiket &amp; Kontak</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Semua tiket dukungan dan pesan kontak.</p>
      {sorted.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada tiket" /></div>
      ) : (
        <div className="mt-6 space-y-2">
          {sorted.map((t) => {
            const customer = t.customerId ? users.find((u) => u.id === t.customerId) : null;
            return (
              <Link key={t.id} href={`/dashboard/tickets/${t.id}`} className="block">
                <Card className="hover:border-neutral-400 dark:hover:border-neutral-600">
                  <CardContent>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{t.subject}</p>
                        <p className="text-xs text-neutral-400">
                          {customer?.name ?? 'Pengunjung'} · {formatDateTime(t.createdAt)} · {t.priority}
                        </p>
                      </div>
                      <Badge variant={t.status === 'open' ? 'info' : t.status === 'pending' ? 'warning' : 'success'}>{t.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
