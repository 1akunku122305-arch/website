import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Masuk', robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Masuk ke Akun</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Masuk untuk mengelola pesanan, layanan, dan tiket Anda.
        </p>
        <LoginForm />
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/register" className="text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-300">
            Daftar akun baru
          </Link>
          <Link href="/forgot-password" className="text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-300">
            Lupa kata sandi?
          </Link>
        </div>
      </div>
    </div>
  );
}
