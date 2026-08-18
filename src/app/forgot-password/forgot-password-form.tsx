'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/display';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Gagal mengirim tautan reset.');
        return;
      }
      setDone(true);
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <Alert variant="success" className="mt-6">Jika email terdaftar, instruksi reset kata sandi akan dikirim.</Alert>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Kirim Tautan Reset
      </Button>
    </form>
  );
}
