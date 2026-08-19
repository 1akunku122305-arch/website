export const dynamic = 'force-dynamic';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Halaman Tidak Ditemukan', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold text-neutral-300 dark:text-neutral-700">404</p>
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-neutral-500 dark:text-neutral-400">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link href="/" className="btn btn-primary mt-2">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
