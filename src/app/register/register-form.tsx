'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Label, FieldError } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/display';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', whatsapp: '' });
  const [error, setError] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Pendaftaran gagal.');
        return;
      }
      const verification = data.data?.emailVerification;
      if (verification?.status === 'not_configured' && verification.devVerifyUrl) {
        setDevVerifyUrl(verification.devVerifyUrl);
        setError(null);
        return;
      }
      // Account created as unverified → send the user to the verification page.
      // cooldown=60 memulai countdown kirim ulang (email baru saja dikirim).
      router.push('/verify-email?status=check-inbox&cooldown=60');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {devVerifyUrl && (
        <Alert variant="info" title="Verifikasi Email (mode pengembangan)">
          <p>
            Layanan email belum dikonfigurasi. Gunakan tautan ini untuk verifikasi:{' '}
            <a href={devVerifyUrl} className="break-all underline">{devVerifyUrl}</a>
          </p>
        </Alert>
      )}
      <div>
        <Label htmlFor="name">Nama</Label>
        <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required minLength={2} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
      </div>
      <div>
        <Label htmlFor="password">Kata Sandi</Label>
        <Input id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} />
        <FieldError message="Minimal 8 karakter." />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp (opsional)</Label>
        <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="628xxxxxxxxxx" />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Daftar
      </Button>
    </form>
  );
}
