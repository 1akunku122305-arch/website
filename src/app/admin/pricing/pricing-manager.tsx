'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/field';
import { Card, CardContent, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatRupiah } from '@/lib/utils';

interface PricingData {
  tiers: Record<string, { status: string }>;
  lowFormula: { base: number; perCore: number; perGbRam: number; perGbStorage: number; roundTo: number; minPrice: number };
  highPackages: Array<{ id: string; cpu: number; ram: number; storage: number; price: number }>;
}

export function PricingManager() {
  const { toast } = useToast();
  const [data, setData] = useState<PricingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediumStatus, setMediumStatus] = useState('ongoing');
  const [low, setLow] = useState({ base: 0, perCore: 0, perGbRam: 0, perGbStorage: 0, roundTo: 500, minPrice: 0 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pricing');
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Gagal memuat.');
      setData(d.data);
      setMediumStatus(d.data.tiers.medium.status);
      setLow({ ...d.data.lowFormula });
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({
          mediumStatus,
          low: { base: Number(low.base), perCore: Number(low.perCore), perGbRam: Number(low.perGbRam), perGbStorage: Number(low.perGbStorage), roundTo: Number(low.roundTo), minPrice: Number(low.minPrice) },
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Gagal menyimpan.');
      toast('Formula harga diperbarui.', 'success');
      load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Gagal.', 'error'); }
    finally { setSaving(false); }
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!data) return <LoadingState />;

  const set = (k: keyof typeof low) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLow((f) => ({ ...f, [k]: Number(e.target.value) }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Formula Harga</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Kelola status tier dan formula harga Low. Mengubah Medium menjadi status available membuatnya dapat dipesan (jika ada paket).
      </p>

      <form onSubmit={save} className="mt-6 space-y-6">
        <Card>
          <CardContent>
            <h2 className="font-semibold">Status Tier</h2>
            <div className="mt-3 space-y-3">
              {['low', 'medium', 'high'].map((t) => (
                <div key={t} className="flex items-center justify-between">
                  <span className="font-medium capitalize">{t}</span>
                  <BadgeState status={data.tiers[t]?.status} />
                </div>
              ))}
              <div>
                <Label>Status Tier Medium</Label>
                <Select value={mediumStatus} onChange={(e) => setMediumStatus(e.target.value)}>
                  <option value="ongoing">Ongoing (belum dapat dipesan)</option>
                  <option value="available">Available (dapat dipesan)</option>
                  <option value="maintenance">Maintenance (tidak dapat dipesan)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="font-semibold">Formula Tier Low</h2>
            <p className="mt-1 text-xs text-neutral-400">base + (CPU × perCore) + (RAM × perGbRam) + (Storage × perGbStorage), dibulatkan.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Num label="Base" value={low.base} onChange={set('base')} />
              <Num label="Per Core" value={low.perCore} onChange={set('perCore')} />
              <Num label="Per GB RAM" value={low.perGbRam} onChange={set('perGbRam')} />
              <Num label="Per GB Storage" value={low.perGbStorage} onChange={set('perGbStorage')} />
              <Num label="Pembulatan" value={low.roundTo} onChange={set('roundTo')} />
              <Num label="Harga Minimum" value={low.minPrice} onChange={set('minPrice')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="font-semibold">Paket High (harga final)</h2>
            <ul className="mt-2 space-y-1 text-sm text-neutral-500">
              {data.highPackages.map((p) => (
                <li key={p.id}>{p.cpu} core · {p.ram} GB · {p.storage} GB — {formatRupiah(p.price)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button type="submit" loading={saving}>Simpan Perubahan</Button>
      </form>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" value={String(value)} onChange={onChange} />
    </div>
  );
}

function BadgeState({ status }: { status?: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status === 'available' ? 'bg-green-100 text-green-700' : status === 'ongoing' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-700'}`}>
      {status}
    </span>
  );
}
