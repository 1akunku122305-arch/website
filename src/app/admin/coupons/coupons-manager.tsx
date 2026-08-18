'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Switch } from '@/components/ui/field';
import { Badge, Card, CardContent, EmptyState, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatRupiah } from '@/lib/utils';
import type { Coupon } from '@/lib/types';

const empty = {
  code: '', discountType: 'percentage' as Coupon['discountType'], discountValue: 0,
  minOrder: '', expiresAt: '', maxUsage: '', maxUsagePerCustomer: '', active: true,
};

export function CouponsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Coupon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setItems(data.data.coupons);
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload: Record<string, unknown> = {
      code: editing.code,
      discountType: editing.discountType,
      discountValue: Number(editing.discountValue) || 0,
      active: Boolean(editing.active),
    };
    if (editing.minOrder !== '' && editing.minOrder != null) payload.minOrder = Number(editing.minOrder);
    if (editing.expiresAt) payload.expiresAt = new Date(editing.expiresAt as string).toISOString();
    if (editing.maxUsage !== '' && editing.maxUsage != null) payload.maxUsage = Number(editing.maxUsage);
    if (editing.maxUsagePerCustomer !== '' && editing.maxUsagePerCustomer != null) payload.maxUsagePerCustomer = Number(editing.maxUsagePerCustomer);
    try {
      const res = await fetch(editing.id ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons', {
        method: editing.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan.');
      toast('Kupon disimpan.', 'success');
      setEditing(null);
      load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Gagal menyimpan.', 'error'); }
    finally { setSaving(false); }
  }

  async function remove(c: Coupon) {
    if (!window.confirm(`Nonaktifkan kupon ${c.code}?`)) return;
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE', headers: { 'x-csrf-token': await getOrCreateCsrfToken() } });
    if (res.ok) { toast('Kupon dinonaktifkan.', 'success'); load(); }
    else toast('Gagal.', 'error');
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!items) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kupon &amp; Promosi</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Validasi selalu server-side.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}>Tambah Kupon</Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada kupon" /></div>
      ) : (
        <div className="mt-6 space-y-2">
          {items.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{c.code}</p>
                    <p className="text-sm text-neutral-500">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : formatRupiah(c.discountValue)} · aktif: {c.active ? 'Ya' : 'Tidak'}
                      {c.maxUsage ? ` · maks ${c.maxUsage} pakai` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing({ ...c, minOrder: c.minOrder ?? '', expiresAt: c.expiresAt ?? '', maxUsage: c.maxUsage ?? '', maxUsagePerCustomer: c.maxUsagePerCustomer ?? '' })}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => remove(c)}>Nonaktifkan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Kupon">
        {editing && (
          <form onSubmit={save} className="space-y-3">
            <div>
              <Label>Kode</Label>
              <Input value={String(editing.code ?? '')} onChange={(e) => setEditing((f) => ({ ...f, code: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipe</Label>
                <Select value={String(editing.discountType)} onChange={(e) => setEditing((f) => ({ ...f, discountType: e.target.value }))}>
                  <option value="percentage">Persentase</option>
                  <option value="fixed">Nominal</option>
                </Select>
              </div>
              <div>
                <Label>Nilai</Label>
                <Input type="number" value={String(editing.discountValue ?? 0)} onChange={(e) => setEditing((f) => ({ ...f, discountValue: Number(e.target.value) }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Order (Rp)</Label><Input type="number" value={String(editing.minOrder ?? '')} onChange={(e) => setEditing((f) => ({ ...f, minOrder: e.target.value }))} /></div>
              <div><Label>Kedaluwarsa</Label><Input type="datetime-local" value={String(editing.expiresAt ?? '').slice(0, 16)} onChange={(e) => setEditing((f) => ({ ...f, expiresAt: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Maks Penggunaan</Label><Input type="number" value={String(editing.maxUsage ?? '')} onChange={(e) => setEditing((f) => ({ ...f, maxUsage: e.target.value }))} /></div>
              <div><Label>Maks per Pelanggan</Label><Input type="number" value={String(editing.maxUsagePerCustomer ?? '')} onChange={(e) => setEditing((f) => ({ ...f, maxUsagePerCustomer: e.target.value }))} /></div>
            </div>
            <Switch label="Aktif" checked={Boolean(editing.active)} onChange={(v) => setEditing((f) => ({ ...f, active: v }))} />
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
