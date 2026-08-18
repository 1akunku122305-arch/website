'use client';

import { useEffect, useState } from 'react';
import { EmptyState, Badge, Card, CardContent, LoadingState, ErrorState } from '@/components/ui/display';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import type { SavedConfiguration } from '@/lib/types';

export default function SavedConfigsPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SavedConfiguration[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/account/saved-configs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setConfigs(data.data.configs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    const res = await fetch(`/api/account/saved-configs/${id}`, {
      method: 'DELETE',
      headers: { 'x-csrf-token': await getOrCreateCsrfToken() },
    });
    if (res.ok) {
      toast('Konfigurasi dihapus.', 'success');
      load();
    } else {
      toast('Gagal menghapus.', 'error');
    }
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!configs) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Konfigurasi Tersimpan</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Konfigurasi server yang Anda simpan ke akun.
      </p>
      {configs.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Belum ada konfigurasi tersimpan" description="Simpan konfigurasi dari Server Builder." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {configs.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{c.name}</p>
                  <Badge variant="neutral">{c.tier}</Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {c.cpu} vCore · {c.ram} GB · {c.storage} GB
                  {c.packageId ? ` · ${c.packageId}` : ''}
                </p>
                <Button variant="ghost" size="sm" className="mt-3 text-red-600" onClick={() => remove(c.id)}>
                  Hapus
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
