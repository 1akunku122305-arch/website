'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea, Switch } from '@/components/ui/field';
import { Card, CardContent, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';

interface Settings {
  siteName?: string; tagline?: string; whatsapp?: string; discord?: string; email?: string;
  twitter?: string; instagram?: string; github?: string;
  maintenanceMode?: boolean; maintenanceTitle?: string; maintenanceMessage?: string; maintenanceEta?: string;
}

export function SettingsManager() {
  const { toast } = useToast();
  const [form, setForm] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setForm(data.data.settings ?? {});
    } catch (e) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan.');
      toast('Pengaturan disimpan.', 'success');
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal.'); }
    finally { setSaving(false); }
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!form) return <LoadingState />;

  const set = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Tema &amp; branding, sosial &amp; kontak, dan mode maintenance.</p>
      </div>
      {error && <Alert variant="error">{error}</Alert>}

      <Card><CardContent className="grid gap-3 sm:grid-cols-2">
        <div><Label>Nama Situs</Label><Input value={form.siteName ?? ''} onChange={set('siteName')} /></div>
        <div><Label>Tagline</Label><Input value={form.tagline ?? ''} onChange={set('tagline')} /></div>
        <div><Label>WhatsApp</Label><Input value={form.whatsapp ?? ''} onChange={set('whatsapp')} /></div>
        <div><Label>Discord</Label><Input value={form.discord ?? ''} onChange={set('discord')} /></div>
        <div><Label>Email</Label><Input value={form.email ?? ''} onChange={set('email')} /></div>
        <div><Label>Twitter</Label><Input value={form.twitter ?? ''} onChange={set('twitter')} /></div>
        <div><Label>Instagram</Label><Input value={form.instagram ?? ''} onChange={set('instagram')} /></div>
        <div><Label>GitHub</Label><Input value={form.github ?? ''} onChange={set('github')} /></div>
      </CardContent></Card>

      <Card><CardContent className="space-y-3">
        <h2 className="font-semibold">Mode Maintenance</h2>
        <Switch label="Aktifkan mode maintenance" checked={Boolean(form.maintenanceMode)} onChange={(v) => setForm((f) => ({ ...f, maintenanceMode: v }))} />
        <div><Label>Judul</Label><Input value={form.maintenanceTitle ?? ''} onChange={set('maintenanceTitle')} /></div>
        <div><Label>Pesan</Label><Textarea value={form.maintenanceMessage ?? ''} onChange={set('maintenanceMessage')} /></div>
        <div><Label>Perkiraan Selesai</Label><Input value={form.maintenanceEta ?? ''} onChange={set('maintenanceEta')} placeholder="mis. 14:00 WIB" /></div>
      </CardContent></Card>

      <Button type="submit" loading={saving}>Simpan Pengaturan</Button>
    </form>
  );
}
