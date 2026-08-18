import type { Metadata } from 'next';
import Link from 'next/link';
import { Alert } from '@/components/ui/display';

export const metadata: Metadata = { title: 'Verifikasi Email', robots: { index: false } };

export default function VerifyEmailPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Verifikasi Email</h1>
        <div className="mt-6">
          {status === 'success' ? (
            <Alert variant="success" title="Email berhasil diverifikasi">
              <p>Akun Anda telah terverifikasi. Silakan masuk ke dashboard.</p>
            </Alert>
          ) : (
            <Alert variant="error" title="Verifikasi gagal">
              <p>Tautan verifikasi tidak valid atau sudah kedaluwarsa.</p>
            </Alert>
          )}
        </div>
        <p className="mt-4">
          <Link href="/dashboard" className="underline hover:text-neutral-900 dark:hover:text-white">Ke Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
