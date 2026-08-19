'use client';

import { useEffect, useState } from 'react';
import { Input, Label, Textarea } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Alert, LoadingState, Badge } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';

interface Profile {
  name: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;
  whatsapp: string;
  discord: string;
  bio: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', whatsapp: '', discord: '', bio: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<{ loading: boolean; message?: string; error?: string }>({ loading: false });

  async function load() {
    try {
      const res = await fetch('/api/account/profile');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat profil.');
      setProfile(data.data);
      setForm({ name: data.data.name, whatsapp: data.data.whatsapp, discord: data.data.discord, bio: data.data.bio });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }

  async function resendVerification(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setResendState({ loading: true });
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({ email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendState({ loading: false, error: data.message || 'Gagal mengirim ulang email verifikasi.' });
        return;
      }
      setResendState({ loading: false, message: 'Email verifikasi telah dikirim. Periksa kotak masuk Anda.' });
    } catch {
      setResendState({ loading: false, error: 'Terjadi kesalahan jaringan.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan profil.');
      toast('Profil berhasil diperbarui.', 'success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(pw),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengubah kata sandi.');
      setPw({ currentPassword: '', newPassword: '' });
      toast('Kata sandi berhasil diubah.', 'success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah kata sandi.');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Profil</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {profile.email} ·{' '}
        {profile.emailVerified ? <Badge variant="success">Email terverifikasi ✓</Badge> : <Badge variant="warning">Belum terverifikasi</Badge>}
      </p>

      {error && <Alert variant="error" className="mt-4">{error}</Alert>}

      {!profile.emailVerified && (
        <Card className="mt-6">
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Status Email</h2>
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Email: {profile.email} · Status: Belum Terverifikasi
                </p>
              </div>
              <form onSubmit={resendVerification} className="flex items-center gap-3">
                {resendState.message && <Alert variant="success" className="!mb-0">{resendState.message}</Alert>}
                {resendState.error && <Alert variant="error" className="!mb-0">{resendState.error}</Alert>}
                <Button type="submit" variant="secondary" loading={resendState.loading}>
                  Kirim Email Verifikasi
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.emailVerified && (
        <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
          Email terverifikasi{profile.emailVerifiedAt ? ` pada ${new Date(profile.emailVerifiedAt).toLocaleString('id-ID')}` : ''}.
        </p>
      )}

      <Card className="mt-6">
        <CardContent>
          <h2 className="font-semibold">Informasi Akun</h2>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="discord">Discord</Label>
              <Input id="discord" value={form.discord} onChange={(e) => setForm((f) => ({ ...f, discord: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            <Button type="submit" loading={saving}>
              Simpan Profil
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent>
          <h2 className="font-semibold">Ubah Kata Sandi</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="cur">Kata Sandi Saat Ini</Label>
              <Input id="cur" type="password" value={pw.currentPassword} onChange={(e) => setPw((f) => ({ ...f, currentPassword: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="new">Kata Sandi Baru</Label>
              <Input id="new" type="password" value={pw.newPassword} onChange={(e) => setPw((f) => ({ ...f, newPassword: e.target.value }))} required minLength={8} />
            </div>
            <Button type="submit" variant="secondary" loading={saving}>
              Ubah Kata Sandi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
