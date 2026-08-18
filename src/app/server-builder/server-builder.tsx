'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, RotateCcw, Check } from 'lucide-react';
import { LOW_CONFIG, normalizeLowConfig, lowQuote, highQuote, mediumQuote, TIERS } from '@/lib/pricing';
import type { PricingQuote } from '@/lib/pricing/estimate';
import { formatRupiah, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label, Checkbox } from '@/components/ui/field';
import { Card, Alert, Badge } from '@/components/ui/display';
import { PackageCard } from '@/components/ui/package-card';
import { HIGH_PACKAGES } from '@/lib/pricing/packages';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { useToast } from '@/components/ui/toast';
import type { TierId } from '@/lib/pricing/tiers';

const SAVED_KEY = 'wangstore_saved_config';

interface SavedConfig {
  tier: TierId;
  cpu: number;
  ram: number;
  storage: number;
  packageId?: string;
}

interface ServerBuilderProps {
  user: { email: string; name: string; userId: string } | null;
}

function sliderSpec(min: number, max: number, step: number) {
  return { min, max, step };
}

export function ServerBuilder({ user }: ServerBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [tier, setTier] = useState<TierId>('low');
  const [low, setLow] = useState({ cpu: 2, ram: 4, storage: 20 });
  const [packageId, setPackageId] = useState('high-2c4g');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    whatsapp: '',
    email: user?.email ?? '',
    serverName: '',
    note: '',
    couponCode: '',
    agreed: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved config from localStorage (guest) on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      if (raw) {
        const c = JSON.parse(raw) as SavedConfig;
        if (c && c.tier) {
          setTier(c.tier);
          if (c.tier === 'low') {
            setLow(normalizeLowConfig({ cpu: c.cpu, ram: c.ram, storage: c.storage }));
          } else if (c.tier === 'high' && c.packageId) {
            setPackageId(c.packageId);
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const normalizedLow = useMemo(() => normalizeLowConfig(low), [low]);

  const quote: PricingQuote = useMemo(() => {
    if (tier === 'low') return lowQuote(normalizedLow);
    if (tier === 'high') {
      try {
        return highQuote(packageId);
      } catch {
        return highQuote('high-2c4g');
      }
    }
    return mediumQuote();
  }, [tier, normalizedLow, packageId]);

  const est = quote.estimate;

  const cpuSpec = sliderSpec(LOW_CONFIG.cpu.min, LOW_CONFIG.cpu.max, LOW_CONFIG.cpu.step);
  const ramSpec = sliderSpec(LOW_CONFIG.ram.min, LOW_CONFIG.ram.max, LOW_CONFIG.ram.step);
  const storageSpec = sliderSpec(LOW_CONFIG.storage.min, LOW_CONFIG.storage.max, LOW_CONFIG.storage.step);

  function saveConfig() {
    const config: SavedConfig =
      tier === 'low'
        ? { tier, ...normalizedLow }
        : tier === 'high'
          ? { tier, cpu: 2, ram: 4, storage: 30, packageId }
          : { tier, cpu: 2, ram: 4, storage: 20 };
    if (!user) {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(config));
      toast('Konfigurasi disimpan di perangkat ini.', 'success');
    } else {
      saveConfigRemote(config);
    }
  }

  async function saveConfigRemote(config: SavedConfig) {
    setLoading(true);
    try {
      const res = await fetch('/api/account/saved-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan.');
      toast('Konfigurasi tersimpan ke akun Anda.', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menyimpan.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function resetConfig() {
    setTier('low');
    setLow({ cpu: 2, ram: 4, storage: 20 });
    setPackageId('high-2c4g');
    setShowForm(false);
    setError(null);
    toast('Konfigurasi direset.', 'info');
  }

  function canOrder(): boolean {
    return quote.orderable;
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!quote.orderable) {
      setError('Tier ini belum dapat dipesan.');
      return;
    }
    if (!form.agreed) {
      setError('Anda harus menyetujui kebijakan WangStore untuk melanjutkan.');
      return;
    }

    const payload = {
      tier,
      cpu: tier === 'low' ? normalizedLow.cpu : undefined,
      ram: tier === 'low' ? normalizedLow.ram : undefined,
      storage: tier === 'low' ? normalizedLow.storage : undefined,
      packageId: tier === 'high' ? packageId : undefined,
      name: form.name,
      whatsapp: form.whatsapp,
      email: form.email,
      serverName: form.serverName,
      note: form.note || undefined,
      couponCode: form.couponCode || undefined,
      agreed: form.agreed,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Gagal membuat order.');
        return;
      }
      toast('Order berhasil dibuat.', 'success');
      const orderId = data.data?.id as string | undefined;
      if (data.data?.whatsappUrl) {
        window.open(data.data.whatsappUrl, '_blank');
      }
      if (orderId) {
        router.push(`/order/${orderId}`);
      } else {
        router.push('/');
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Server Builder</h1>
      <p className="mt-2 max-w-2xl text-neutral-500 dark:text-neutral-400">
        Pilih tier dan konfigurasi. Harga dihitung server-side dan bersifat final.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Step 1: tier */}
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Badge variant="info">1</Badge>
              <h2 className="text-lg font-semibold">Pilih Tier</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(['low', 'medium', 'high'] as TierId[]).map((id) => {
                const t = TIERS[id];
                const ongoing = t.status !== 'available';
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTier(id);
                      setShowForm(false);
                      setError(null);
                    }}
                    aria-pressed={tier === id}
                    className={cn(
                      'rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500',
                      tier === id
                        ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                        : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{t.label}</span>
                      {ongoing && <Badge variant="warning">Ongoing</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t.cpuLabel}</p>
                    <p className="mt-1 text-xs text-neutral-400">{t.mode === 'custom' ? 'Konfigurasi custom' : 'Paket tetap'}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: config */}
          {tier === 'low' && (
            <section className="card mt-5 p-5">
              <div className="flex items-center gap-2">
                <Badge variant="info">2</Badge>
                <h2 className="text-lg font-semibold">Konfigurasi</h2>
              </div>
              <div className="mt-5 space-y-6">
                <SliderBlock label="CPU" value={normalizedLow.cpu} unit="vCore" {...cpuSpec} onChange={(v) => setLow((c) => ({ ...c, cpu: v }))} />
                <SliderBlock label="RAM" value={normalizedLow.ram} unit="GB" {...ramSpec} onChange={(v) => setLow((c) => ({ ...c, ram: v }))} />
                <SliderBlock label="Penyimpanan" value={normalizedLow.storage} unit="GB" {...storageSpec} onChange={(v) => setLow((c) => ({ ...c, storage: v }))} />
              </div>
            </section>
          )}

          {tier === 'high' && (
            <section className="card mt-5 p-5">
              <div className="flex items-center gap-2">
                <Badge variant="info">2</Badge>
                <h2 className="text-lg font-semibold">Pilih Paket</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {HIGH_PACKAGES.map((p) => (
                  <PackageCard
                    key={p.id}
                    data={{
                      id: p.id,
                      cpu: p.cpu,
                      ram: p.ram,
                      storage: p.storage,
                      price: p.price,
                      label: p.label,
                      popular: p.popular,
                    }}
                    selected={packageId === p.id}
                    onSelect={setPackageId}
                  />
                ))}
              </div>
            </section>
          )}

          {tier === 'medium' && (
            <section className="card mt-5 p-6">
              <div className="flex items-center gap-2">
                <Badge variant="warning">Ongoing</Badge>
              </div>
              <h2 className="mt-2 text-lg font-semibold">Tier Medium</h2>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                Tier Medium sedang dipersiapkan dan belum dapat dipesan.
              </p>
              <Button className="mt-4" disabled>
                Paket Belum Tersedia
              </Button>
            </section>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={saveConfig} loading={loading}>
              <Save className="h-4 w-4" /> Simpan Konfigurasi
            </Button>
            <Button variant="ghost" onClick={resetConfig}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            {quote.orderable && (
              <Button onClick={() => setShowForm((s) => !s)}>
                {showForm ? 'Sembunyikan Form' : 'Pesan Sekarang'} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Purchase warning */}
          <Alert variant="warning" title="Peringatan Pembelian" className="mt-5">
            <p>
              Pastikan konfigurasi Anda sudah benar sebelum melakukan pembayaran. Pembelian bersifat final sesuai kebijakan WangStore.
              Jika ragu, konsultasikan terlebih dahulu.
            </p>
          </Alert>
        </div>

        {/* Sidebar: price + estimate */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <h3 className="font-semibold">Harga Bulanan</h3>
            {quote.orderable ? (
              <p className="mt-2 text-3xl font-bold">{formatRupiah(quote.price)}</p>
            ) : (
              <p className="mt-2 text-base text-amber-600">{quote.unorderableReason}</p>
            )}
            <p className="text-xs text-neutral-400">per bulan</p>

            <dl className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm dark:border-neutral-800">
              <div className="flex justify-between"><dt className="text-neutral-500">Tier</dt><dd className="font-medium">{TIERS[tier].label}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">CPU</dt><dd className="font-medium">{quote.config && 'cpu' in quote.config ? quote.config.cpu : tier === 'high' ? HIGH_PACKAGES.find((p) => p.id === packageId)?.cpu : '—'} vCore</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">RAM</dt><dd className="font-medium">{quote.config && 'ram' in quote.config ? quote.config.ram : tier === 'high' ? HIGH_PACKAGES.find((p) => p.id === packageId)?.ram : '—'} GB</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Penyimpanan</dt><dd className="font-medium">{quote.config && 'storage' in quote.config ? quote.config.storage : tier === 'high' ? HIGH_PACKAGES.find((p) => p.id === packageId)?.storage : '—'} GB</dd></div>
            </dl>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Estimasi Performa</h3>
              <Badge variant="info">Estimasi</Badge>
            </div>
            <p className="mt-1 text-xs text-neutral-400">Perkiraan berdasarkan konfigurasi, bukan jaminan/SLA.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <EstRow label="Estimasi TPS" value={String(est.tps)} />
              <EstRow label="Estimasi pemain konkuren" value={String(est.concurrentPlayers)} />
              <EstRow label="Estimasi CPU load" value={`${est.cpuLoadPercent}%`} />
              <EstRow label="Estimasi RAM usage" value={`${est.ramUsageGb} GB`} />
              <EstRow label="Rekomendasi plugin" value={`${est.plugins.min}–${est.plugins.max}`} />
              <EstRow label="Grade build" value={est.grade} />
            </dl>
          </Card>
        </aside>
      </div>

      {/* Order form */}
      {showForm && quote.orderable && (
        <section className="card mx-auto mt-8 max-w-2xl p-6">
          <h2 className="text-xl font-semibold">Informasi Pemesanan</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Harga dihitung ulang oleh server. {user ? 'Data Anda telah diisi otomatis.' : 'Anda dapat login untuk mengisi data otomatis.'}
          </p>
          <form onSubmit={placeOrder} className="mt-5 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input id="name" value={form.name} onChange={set('name')} required placeholder="Nama lengkap" />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={set('whatsapp')} required placeholder="628xxxxxxxxxx" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="email@contoh.com" />
            </div>
            <div>
              <Label htmlFor="serverName">Nama Server</Label>
              <Input id="serverName" value={form.serverName} onChange={set('serverName')} required placeholder="Nama server Anda" />
            </div>
            <div>
              <Label htmlFor="note">Catatan (opsional)</Label>
              <Textarea id="note" value={form.note} onChange={set('note')} placeholder="Catatan tambahan untuk pesanan" />
            </div>
            <div>
              <Label htmlFor="coupon">Kupon (opsional)</Label>
              <Input id="coupon" value={form.couponCode} onChange={set('couponCode')} placeholder="Kode kupon" />
            </div>
            <Checkbox
              label="Saya memahami bahwa konfigurasi sudah benar dan pembelian bersifat final sesuai kebijakan WangStore. Pembelian saya wajib disertai persetujuan ini."
              checked={form.agreed}
              onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))}
            />
            <Button type="submit" loading={loading} className="w-full">
              <Check className="h-4 w-4" /> Buat Order
            </Button>
            <p className="text-center text-xs text-neutral-400">
              Setelah order dibuat, Anda akan diarahkan ke WhatsApp untuk menyelesaikan pemesanan.
            </p>
          </form>
        </section>
      )}

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-neutral-400">
        WangStore adalah platform penjualan dan pengelolaan layanan hosting. Layanan infrastruktur dijalankan oleh penyedia terkait.
      </p>
    </div>
  );
}

function SliderBlock({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Label htmlFor={`slider-${label}`}>{label}</Label>
        <span className="text-sm font-medium">
          {value} {unit}
        </span>
      </div>
      <input
        id={`slider-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-neutral-900 dark:accent-white"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

function EstRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
