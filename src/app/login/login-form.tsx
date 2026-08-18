'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Label } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/display';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login gagal.');
        return;
      }
      const role = data.data?.user?.role;
      router.push(role === 'customer' ? '/dashboard' : '/admin');
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
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Kata Sandi</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Masuk
      </Button>
    </form>
  );
}
