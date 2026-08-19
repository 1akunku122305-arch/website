'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Label } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert, LoadingState, Card, CardContent } from '@/components/ui/display';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';

type Status = 'check-inbox' | 'unverified' | 'success' | 'already_verified' | 'expired' | 'invalid' | null;

const KNOWN: Record<string, Status> = {
  'check-inbox': 'check-inbox',
  unverified: 'unverified',
  success: 'success',
  already_verified: 'already_verified',
  expired: 'expired',
  invalid: 'invalid',
};

function normalizeStatus(raw?: string): Status {
  if (!raw) return null;
  return KNOWN[raw] ?? null;
}

export function VerifyEmailView({
  initialStatus,
  token,
  initialCooldown,
}: {
  initialStatus?: string;
  token?: string;
  initialCooldown?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(normalizeStatus(initialStatus));
  const [checking, setChecking] = useState(Boolean(token));
  const [email, setEmail] = useState('');
  const [emailKnown, setEmailKnown] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(Math.max(0, Math.floor(seconds)));
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1 && timerRef.current) clearInterval(timerRef.current);
        return Math.max(0, c - 1);
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  const verify = useCallback(
    async (t: string) => {
      setChecking(true);
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
          body: JSON.stringify({ token: t }),
        });
        const data = await res.json();
        const next = (data.data?.status as Status) ?? 'invalid';
        setStatus(next);
        router.replace(`/verify-email?status=${next}`);
      } catch {
        setStatus('invalid');
        router.replace('/verify-email?status=invalid');
      } finally {
        setChecking(false);
      }
    },
    [router],
  );

  useEffect(() => {
    // Identify the account when a session exists (register/login keep one
    // even while unverified) so we can prefill the resend form.
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.email) {
          setEmail(d.data.email);
          setEmailKnown(true);
          if (!d.data.emailVerified && !token && !initialStatus) {
            setStatus('unverified');
          } else if (d.data.emailVerified && !token && !initialStatus) {
            setStatus('already_verified');
          }
        }
      })
      .catch(() => {});
    if (token) {
      void verify(token);
    } else if (initialCooldown) {
      const secs = Number.parseInt(initialCooldown, 10);
      if (Number.isFinite(secs) && secs > 0) startCountdown(secs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resend(e?: React.FormEvent) {
    e?.preventDefault();
    if (countdown > 0) return;
    setResendLoading(true);
    setResendMessage(null);
    setResendError(null);
    setDevUrl(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        const retry = data.errors?.retryAfterSeconds ?? data.retryAfterSeconds;
        setResendError(data.message ?? 'Gagal mengirim ulang email verifikasi.');
        if (typeof retry === 'number' && retry > 0) startCountdown(retry);
        return;
      }
      const d = data.data ?? {};
      if (d.status === 'already_verified') {
        setStatus('already_verified');
        setResendMessage('Email Anda sudah terverifikasi.');
        return;
      }
      setResendMessage('Email verifikasi telah dikirim. Periksa kotak masuk Anda (termasuk folder spam).');
      if (d.devVerifyUrl) setDevUrl(d.devVerifyUrl);
      startCountdown(60);
    } catch {
      setResendError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setResendLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Verifikasi Email</h1>
        <LoadingState label="Memverifikasi email Anda…" />
      </div>
    );
  }

  const showResend = status === 'expired' || status === 'invalid' || status === 'check-inbox' || status === 'unverified' || status === null;

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold">Verifikasi Email</h1>

      {status === 'success' && (
        <div className="mt-6 space-y-4">
          <Alert variant="success" title="✅ Email berhasil diverifikasi">
            <p>Terima kasih! Alamat email Anda sudah dikonfirmasi dan akun Anda sekarang <strong>aktif</strong>.</p>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push('/dashboard')}>Ke Dashboard</Button>
            <Link href="/login" className="btn btn-secondary">Ke Halaman Login</Link>
          </div>
        </div>
      )}

      {status === 'already_verified' && (
        <div className="mt-6 space-y-4">
          <Alert variant="success" title="✅ Email sudah terverifikasi">
            <p>Alamat email Anda sudah terverifikasi sebelumnya. Akun Anda aktif dan siap digunakan.</p>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push('/dashboard')}>Ke Dashboard</Button>
            <Link href="/login" className="btn btn-secondary">Ke Halaman Login</Link>
          </div>
        </div>
      )}

      {status === 'expired' && (
        <div className="mt-6 space-y-4">
          <Alert variant="error" title="❌ Link verifikasi sudah kedaluwarsa">
            <p>Tautan verifikasi ini sudah melewati batas waktu berlakunya. Kirim ulang email verifikasi untuk mendapatkan tautan baru.</p>
          </Alert>
        </div>
      )}

      {status === 'invalid' && (
        <div className="mt-6 space-y-4">
          <Alert variant="error" title="❌ Link verifikasi tidak valid atau sudah digunakan">
            <p>Tautan verifikasi tidak dikenali, sudah pernah digunakan, atau tidak berlaku lagi. Kirim ulang email verifikasi untuk mendapatkan tautan baru.</p>
          </Alert>
        </div>
      )}

      {status === 'check-inbox' && (
        <div className="mt-6 space-y-4">
          <Alert variant="info" title="📩 Periksa email Anda">
            <p>Akun berhasil dibuat. Kami telah mengirim tautan verifikasi ke email Anda. Buka email tersebut dan klik <strong>Verifikasi Email Saya</strong> untuk mengaktifkan akun.</p>
            {emailKnown && <p className="mt-2 text-sm"><strong>Email:</strong> {email}</p>}
          </Alert>
        </div>
      )}

      {status === 'unverified' && (
        <div className="mt-6 space-y-4">
          <Alert variant="warning" title="Verifikasi Email Anda">
            <p>Akun Anda belum terverifikasi. Untuk mengakses dashboard dan fitur utama, verifikasi alamat email Anda terlebih dahulu.</p>
            {emailKnown && <p className="mt-2 text-sm"><strong>Email:</strong> {email}</p>}
          </Alert>
        </div>
      )}

      {showResend && (
        <Card className="mt-6">
          <CardContent>
            <h2 className="font-semibold">Kirim Ulang Email Verifikasi</h2>
            <form onSubmit={resend} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="resend-email">Email</Label>
                <Input
                  id="resend-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@email.com"
                  autoComplete="email"
                />
              </div>
              {resendError && <Alert variant="error">{resendError}</Alert>}
              {resendMessage && <Alert variant="success">{resendMessage}</Alert>}
              {devUrl && (
                <Alert variant="info" title="Mode pengembangan (email belum dikonfigurasi)">
                  <a href={devUrl} className="break-all underline">{devUrl}</a>
                </Alert>
              )}
              <Button type="submit" className="w-full" loading={resendLoading} disabled={countdown > 0}>
                {countdown > 0 ? `Kirim ulang dalam ${countdown} detik` : 'Kirim Ulang Email Verifikasi'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <p className="mt-4 text-sm">
        <Link href="/login" className="underline hover:text-neutral-900 dark:hover:text-white">Ke Halaman Login</Link>
        {' · '}
        <Link href="/register" className="underline hover:text-neutral-900 dark:hover:text-white">Daftar Akun</Link>
      </p>
    </div>
  );
}
