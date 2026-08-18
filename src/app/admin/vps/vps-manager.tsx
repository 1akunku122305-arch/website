'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea, Switch } from '@/components/ui/field';
import { Badge, Card, CardContent, EmptyState, LoadingState, ErrorState } from '@/components/ui/display';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatRupiah } from '@/lib/utils';
import type { VpsPackage, VpsLocation } from '@/lib/types';

const empty = {
  name: '', slug: '', cpu: 1, ram: 2, storage: 20, bandwidth: 1000,
  locationId: '', price: 0, billingPeriod: 'monthly', renewable: true,
  status: 'available', visibility: 'public', ipv4: true, virtualization: '',
  description: '', features: [], serviceDays: 30,
};

export function VpsManager() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<VpsPackage[] | null>(null);
  const [locations, setLocations] = useState<VpsLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/vps');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setPackages(data.data.packages);
      setLocations(data.data.locations);
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload = {
      name: editing.name, slug: editing.slug, cpu: Number(editing.cpu), ram: Number(editing.ram),
      storage: Number(editing.storage), bandwidth: Number(editing.bandwidth), locationId: editing.locationId,
      price: Number(editing.price), billingPeriod: editing.billingPeriod, renewable: Boolean(editing.renewable),
      status: editing.status, visibility: editing.visibility, ipv4: Boolean(editing.ipv4),
      virtualization: editing.virtualization ?? '', description: editing.description ?? '',
      features: Array.isArray(editing.features) ? editing.features : String(editing.features ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      serviceDays: Number(editing.serviceDays),
    };
    try {
      const res = await fetch(editing.id ? `/api/admin/vps/${editing.id}` : '/api/admin/vps', {
        method: editing.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan.');
      toast('Paket VPS disimpan.', 'success');
      setEditing(null);
      load();
    } catch (err) { toast(err instanceof Error ? err.message : 'Gagal.', 'error'); }
    finally { setSaving(false); }
  }

  async function remove(pkg: VpsPackage) {
    if (!window.confirm(`Arsipkan ${pkg.name}?`)) return;
    const res = await fetch(`/api/admin/vps/${pkg.id}`, { method: 'DELETE', headers: { 'x-csrf-token': await getOrCreateCsrfToken() } });
    if (res.ok) { toast('Paket diarsipkan.', 'success'); load(); } else toast('Gagal.', 'error');
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!packages) return <LoadingState />;

  const statusBadge: Record<string, 'success' | 'error' | 'warning' | 'neutral'> = {
    available: 'success', sold_out: 'error', maintenance: 'warning', inactive: 'neutral',
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">VPS Packages</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Kelola paket VPS dari database.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}>Tambah Paket</Button>
      </div>

      {packages.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada paket VPS" /></div>
      ) : (
        <div className="mt-6 space-y-2">
          {packages.map((p) => (
            <Card key={p.id}>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.name} <Badge variant={statusBadge[p.status] ?? 'neutral'}>{p.status}</Badge></p>
                    <p className="text-sm text-neutral-500">{p.cpu} vCore · {p.ram} GB · {p.storage} GB · {formatRupiah(p.price)} · renewable: {p.renewable ? 'Ya' : 'Tidak'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing({ ...p, features: p.features.join(', ') })}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => remove(p)}>Arsipkan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Paket VPS">
        {editing && (
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Nama</Label><Input value={String(editing.name ?? '')} onChange={(e) => setEditing((f) => ({ ...f, name: e.target.value }))} required /></div>
            <div><Label>Slug</Label><Input value={String(editing.slug ?? '')} onChange={(e) => setEditing((f) => ({ ...f, slug: e.target.value }))} /></div>
            <div><Label>Harga (Rp)</Label><Input type="number" value={String(editing.price ?? 0)} onChange={(e) => setEditing((f) => ({ ...f, price: Number(e.target.value) }))} required /></div>
            <Num label="CPU (vCore)" value={editing.cpu} onChange={(v) => setEditing((f) => ({ ...f, cpu: v }))} />
            <Num label="RAM (GB)" value={editing.ram} onChange={(v) => setEditing((f) => ({ ...f, ram: v }))} />
            <Num label="Storage (GB)" value={editing.storage} onChange={(v) => setEditing((f) => ({ ...f, storage: v }))} />
            <Num label="Bandwidth (GB)" value={editing.bandwidth} onChange={(v) => setEditing((f) => ({ ...f, bandwidth: v }))} />
            <div>
              <Label>Lokasi</Label>
              <Select value={String(editing.locationId ?? '')} onChange={(e) => setEditing((f) => ({ ...f, locationId: e.target.value }))}>
                <option value="">— Pilih —</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.city}, {l.country}</option>)}
              </Select>
            </div>
            <div>
              <Label>Periode</Label>
              <Select value={String(editing.billingPeriod ?? 'monthly')} onChange={(e) => setEditing((f) => ({ ...f, billingPeriod: e.target.value }))}>
                <option value="monthly">Bulanan</option><option value="quarterly">3 bulan</option><option value="semi_annual">6 bulan</option><option value="annual">Tahunan</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={String(editing.status ?? 'available')} onChange={(e) => setEditing((f) => ({ ...f, status: e.target.value }))}>
                <option value="available">Tersedia</option><option value="sold_out">Habis</option><option value="maintenance">Maintenance</option><option value="inactive">Nonaktif</option>
              </Select>
            </div>
            <div>
              <Label>Visibilitas</Label>
              <Select value={String(editing.visibility ?? 'public')} onChange={(e) => setEditing((f) => ({ ...f, visibility: e.target.value }))}>
                <option value="public">Publik</option><option value="hidden">Tersembunyi</option>
              </Select>
            </div>
            <Num label="Masa Aktif (hari)" value={editing.serviceDays} onChange={(v) => setEditing((f) => ({ ...f, serviceDays: v }))} />
            <div><Label>Virtualisasi</Label><Input value={String(editing.virtualization ?? '')} onChange={(e) => setEditing((f) => ({ ...f, virtualization: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Fitur (koma)</Label><Input value={String(editing.features ?? '')} onChange={(e) => setEditing((f) => ({ ...f, features: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Deskripsi</Label><Textarea value={String(editing.description ?? '')} onChange={(e) => setEditing((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="flex items-center justify-between sm:col-span-2">
              <Switch label="Renewable" checked={Boolean(editing.renewable)} onChange={(v) => setEditing((f) => ({ ...f, renewable: v }))} />
              <Switch label="IPv4" checked={Boolean(editing.ipv4)} onChange={(v) => setEditing((f) => ({ ...f, ipv4: v }))} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button>
              <Button type="submit" loading={saving}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: unknown; onChange: (v: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" value={String(value ?? 0)} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </div>
  );
}
