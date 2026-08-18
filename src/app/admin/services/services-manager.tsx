'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea, Switch } from '@/components/ui/field';
import { Badge, Card, CardContent, EmptyState, LoadingState, ErrorState } from '@/components/ui/display';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface ServiceRow {
  id: string; customer: { name: string; email: string } | null; order: { id: string; status: string } | null;
  serviceType: string; status: string; activationAt: string; expiresAt: string; renewable: boolean;
  price: number; remainingDays: number;
}

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
  active: 'success', scheduled: 'info', pending: 'info', suspended: 'warning', expired: 'error', cancelled: 'error', terminated: 'error',
};

export function ServicesManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<(ServiceRow & { durationDays?: number; reason?: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setServices(data.data.services);
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload: Record<string, unknown> = {
      status: editing.status,
      renewable: editing.renewable,
      durationDays: Number(editing.durationDays) || 30,
      manualExtension: { reason: String(editing.reason ?? 'Manual extension') },
    };
    try {
      const res = await fetch(`/api/admin/services/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan.');
      toast('Layanan diperbarui.', 'success');
      setEditing(null);
      load();
    } catch (err) { toast(err instanceof Error ? err.message : 'Gagal.', 'error'); }
    finally { setSaving(false); }
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!services) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Layanan</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Kelola lifecycle layanan pelanggan.</p>
        </div>
      </div>
      {services.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada layanan" description="Layanan dibuat saat order dikonfirmasi." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{s.id} <Badge variant={statusVariant[s.status] ?? 'neutral'}>{s.status}</Badge></p>
                    <p className="text-sm text-neutral-500">
                      {s.customer?.name ?? '—'} · {formatRupiah(s.price)}/bulan
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setEditing({ ...s, durationDays: 30, reason: '' })}>Kelola</Button>
                </div>
                <p className="mt-2 text-xs text-neutral-400">
                  Aktivasi {formatDateTime(s.activationAt)} · Kedaluwarsa {formatDateTime(s.expiresAt)} · Sisa {s.remainingDays} hari · Renewable {s.renewable ? 'Ya' : 'Tidak'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={`Kelola ${editing?.id ?? ''}`}>
        {editing && (
          <form onSubmit={save} className="space-y-3">
            <div>
              <Label>Status</Label>
              <Select value={editing.status} onChange={(e) => setEditing((f) => (f ? { ...f, status: e.target.value } : f))}>
                {['pending', 'scheduled', 'active', 'suspended', 'expired', 'cancelled', 'terminated'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Perpanjang Masa (hari)</Label>
              <Input type="number" value={String(editing.durationDays ?? 30)} onChange={(e) => setEditing((f) => (f ? { ...f, durationDays: Number(e.target.value) } : f))} min={1} />
            </div>
            <div>
              <Label>Alasan Manual Extension</Label>
              <Textarea value={String(editing.reason ?? '')} onChange={(e) => setEditing((f) => (f ? { ...f, reason: e.target.value } : f))} />
            </div>
            <Switch label="Renewable" checked={editing.renewable} onChange={(v) => setEditing((f) => (f ? { ...f, renewable: v } : f))} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button>
              <Button type="submit" loading={saving}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
