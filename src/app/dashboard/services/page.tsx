export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import { Badge, EmptyState, Card, CardContent, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatRupiah, formatDateTime, cn } from '@/lib/utils';

interface ServiceRow {
  id: string;
  customerId: string;
  orderId: string;
  serviceType: string;
  status: string;
  activationAt: string;
  expiresAt: string;
  renewable: boolean;
  price: number;
  remainingDays: number;
  order: { id: string; status: string; total: number } | null;
}

function statusVariant(s: string) {
  if (s === 'active') return 'success' as const;
  if (s === 'scheduled' || s === 'pending') return 'info' as const;
  if (s === 'expired' || s === 'suspended' || s === 'cancelled' || s === 'terminated') return 'error' as const;
  return 'neutral' as const;
}

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat layanan.');
      setServices(data.data.services);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function renew(service: ServiceRow) {
    setRenewingId(service.id);
    try {
      const res = await fetch(`/api/services/${service.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({ durationDays: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperpanjang.');
      if (data.data?.whatsappUrl) window.open(data.data.whatsappUrl, '_blank');
      toast(data.data?.message || 'Order perpanjangan dibuat.', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal memperpanjang.', 'error');
    } finally {
      setRenewingId(null);
    }
  }

  if (error && !services) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!services) return <LoadingState label="Memuat layanan…" />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Layanan Saya</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Kelola masa aktif dan perpanjangan layanan Anda.
      </p>

      {services.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Belum ada layanan"
            description="Layanan dibuat setelah pesanan Anda dikonfirmasi oleh tim WangStore."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{s.id}</p>
                    <p className="text-xs text-neutral-400">
                      Order: {s.order?.id ?? s.orderId} · {formatRupiah(s.price)}/bulan
                    </p>
                  </div>
                  <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                </div>

                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <Detail label="Aktivasi" value={formatDateTime(s.activationAt)} />
                  <Detail label="Kedaluwarsa" value={formatDateTime(s.expiresAt)} />
                  <Detail label="Sisa Masa" value={`${s.remainingDays} hari`} />
                </dl>

                <div className="mt-4">
                  {s.renewable && s.status !== 'expired' ? (
                    <Button onClick={() => renew(s)} loading={renewingId === s.id} variant="secondary">
                      Perpanjang Layanan
                    </Button>
                  ) : (
                    <p className={cn('text-sm', s.renewable ? 'text-neutral-500' : 'text-neutral-400')}>
                      {s.renewable && s.status === 'expired'
                        ? 'Layanan kedaluwarsa — dapat diperpanjang.'
                        : 'Layanan ini tidak dapat diperpanjang.'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Alert variant="info" title="Catatan">
          Masa layanan diperpanjang hanya setelah pembayaran/konfirmasi diverifikasi. Status dihitung berdasarkan waktu server.
        </Alert>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
