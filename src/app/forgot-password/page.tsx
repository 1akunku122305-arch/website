export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = { title: 'Lupa Kata Sandi', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Lupa Kata Sandi</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Masukkan email Anda untuk menerima tautan reset kata sandi.
        </p>
        <ForgotPasswordForm />
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline hover:text-neutral-900 dark:hover:text-white">Kembali ke Masuk</Link>
        </p>
      </div>
    </div>
  );
}
