'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
        <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
          <p className="max-w-md text-neutral-500 dark:text-neutral-400">
            Maaf, terjadi kesalahan pada aplikasi. Silakan coba lagi.
          </p>
          <button onClick={reset} className="btn btn-primary mt-2">
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
