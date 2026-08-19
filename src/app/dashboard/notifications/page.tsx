'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Card, CardContent, LoadingState, ErrorState } from '@/components/ui/display';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatDateTime } from '@/lib/utils';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/account/notifications');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setItems(data.data.notifications);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id?: string) {
    await fetch('/api/account/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
      body: JSON.stringify(id ? { id } : {}),
    });
    load();
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!items) return <LoadingState />;

  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {unread > 0 ? `${unread} belum dibaca` : 'Semua notifikasi sudah dibaca.'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markRead()}>
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Belum ada notifikasi" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((n) => (
            <Card key={n.id} className={!n.read ? 'border-neutral-400 dark:border-neutral-600' : ''}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{n.body}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {formatDateTime(n.createdAt)} · kanal: {n.channel}
                      {!n.channelConfigured && ' (belum dikonfigurasi)'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!n.read ? <Badge variant="info">Baru</Badge> : <Badge>Dibaca</Badge>}
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                        Tandai dibaca
                      </Button>
                    )}
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
