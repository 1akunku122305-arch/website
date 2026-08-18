import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Reset Kata Sandi', robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Reset Kata Sandi</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Masukkan kata sandi baru Anda.</p>
        <ResetPasswordForm />
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline hover:text-neutral-900 dark:hover:text-white">Kembali ke Masuk</Link>
        </p>
      </div>
    </div>
  );
}
