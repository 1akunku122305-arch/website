'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
      <p className="max-w-md text-neutral-500 dark:text-neutral-400">
        Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
      </p>
      <button onClick={reset} className="btn btn-primary mt-2">
        Coba lagi
      </button>
    </div>
  );
}
