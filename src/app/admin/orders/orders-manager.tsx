'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent, EmptyState, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import type { Order } from '@/lib/types';

const STATUSES: Order['status'][] = ['pending', 'awaiting_payment', 'paid', 'processing', 'completed', 'cancelled', 'expired', 'refunded'];

const statusVariant: Record<string, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'success', completed: 'success', processing: 'info', awaiting_payment: 'warning', pending: 'info', cancelled: 'error', expired: 'error', refunded: 'error',
};

export function OrdersManager() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setOrders(data.data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(order: Order, status: Order['status']) {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengubah status.');
      toast(`Status ${order.id} → ${status}`, 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal mengubah status.', 'error');
    }
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!orders) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesanan</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Kelola status pesanan. Pembayaran dikonfirmasi di sini.</p>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada pesanan" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.id}</Link>
                    <p className="text-xs text-neutral-400">{formatDateTime(o.createdAt)} · {o.name}</p>
                  </div>
                  <Badge variant={statusVariant[o.status] ?? 'neutral'}>{o.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-neutral-500">
                    {o.tier} · {o.cpu} vCore · {o.ram} GB · {o.storage} GB · {formatRupiah(o.total)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.filter((s) => s !== o.status).map((s) => (
                      <Button key={s} variant="secondary" size="sm" onClick={() => changeStatus(o, s)}>
                        → {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
