import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Daftar', robots: { index: false } };

export default function RegisterPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Daftar Akun</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Buat akun untuk menyimpan konfigurasi, melihat riwayat order, dan mengelola layanan.
        </p>
        <RegisterForm />
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="underline hover:text-neutral-900 dark:hover:text-white">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
