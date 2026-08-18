'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/field';
import { Badge, Card, CardContent, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface OrderRow {
  id: string; name: string; whatsapp: string; email: string; serverName: string;
  tier: string; cpu: number; ram: number; storage: number; subtotal: number;
  discount: number; total: number; status: string; couponCode?: string; createdAt: string;
}
interface ServiceRow { id: string; status: string; activationAt: string; expiresAt: string; renewable: boolean; }

export default function AdminOrderDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [data, setData] = useState<{ order: OrderRow; service: ServiceRow | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activationAt, setActivationAt] = useState('');
  const [durationDays, setDurationDays] = useState('30');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Gagal memuat.');
      setData(d.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }, [params.id]);
  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(status: string) {
    const body: Record<string, unknown> = { status };
    if (status === 'paid') {
      if (activationAt) body.activationAt = new Date(activationAt).toISOString();
      body.durationDays = Number(durationDays) || 30;
    }
    const res = await fetch(`/api/admin/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) return toast(d.message || 'Gagal.', 'error');
    toast(`Status → ${status}`, 'success');
    load();
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!data) return <LoadingState />;

  const o = data.order;
  return (
    <div>
      <h1 className="text-2xl font-bold">{o.id}</h1>
      <p className="mt-1 text-sm text-neutral-500">{formatDateTime(o.createdAt)}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Detail Order</h2>
              <Badge variant="info">{o.status}</Badge>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <Info label="Nama" value={o.name} />
              <Info label="WhatsApp" value={o.whatsapp} />
              <Info label="Email" value={o.email} />
              <Info label="Nama Server" value={o.serverName} />
              <Info label="Tier" value={o.tier} />
              <Info label="Spesifikasi" value={`${o.cpu} vCore · ${o.ram} GB · ${o.storage} GB`} />
              <Info label="Subtotal" value={formatRupiah(o.subtotal)} />
              <Info label="Total" value={formatRupiah(o.total)} />
              {o.couponCode && <Info label="Kupon" value={o.couponCode} />}
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <h2 className="font-semibold">Ubah Status</h2>
              <p className="mt-1 text-xs text-neutral-400">Konfirmasi pembayaran membuat layanan (sesuai waktu aktivasi).</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Waktu Aktivasi (opsional)</Label>
                  <Input type="datetime-local" value={activationAt} onChange={(e) => setActivationAt(e.target.value)} />
                </div>
                <div>
                  <Label>Durasi (hari)</Label>
                  <Input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} min={1} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['awaiting_payment', 'paid', 'processing', 'completed', 'cancelled', 'expired', 'refunded'].map((s) => (
                  <Button key={s} variant="secondary" size="sm" onClick={() => updateStatus(s)}>→ {s}</Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-semibold">Layanan Terkait</h2>
              {data.service ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p>ID: {data.service.id}</p>
                  <p>Status: <Badge variant="info">{data.service.status}</Badge></p>
                  <p>Aktivasi: {formatDateTime(data.service.activationAt)}</p>
                  <p>Kedaluwarsa: {formatDateTime(data.service.expiresAt)}</p>
                  <p>Renewable: {data.service.renewable ? 'Ya' : 'Tidak'}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">Belum ada layanan. Konfirmasi pembayaran (→ paid) untuk membuat layanan.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-400">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}
