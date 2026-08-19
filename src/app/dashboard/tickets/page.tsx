export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input, Textarea, Label, Select } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Card, CardContent, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatDateTime } from '@/lib/utils';
import type { Ticket } from '@/lib/types';

export default function TicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', body: '', priority: 'normal' as Ticket['priority'] });
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setTickets(data.data.tickets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat tiket.');
      toast('Tiket berhasil dibuat.', 'success');
      setForm({ subject: '', body: '', priority: 'normal' });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuat tiket.');
    } finally {
      setCreating(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Tiket</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Tiket dukungan Anda.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-semibold">Buat Tiket Baru</h2>
          <form onSubmit={create} className="mt-3 space-y-3">
            {error && <Alert variant="error">{error}</Alert>}
            <div>
              <Label htmlFor="subject">Subjek</Label>
              <Input id="subject" value={form.subject} onChange={set('subject')} required />
            </div>
            <div>
              <Label htmlFor="body">Pesan</Label>
              <Textarea id="body" value={form.body} onChange={set('body')} required />
            </div>
            <div>
              <Label htmlFor="priority">Prioritas</Label>
              <Select id="priority" value={form.priority} onChange={set('priority')}>
                <option value="low">Rendah</option>
                <option value="normal">Normal</option>
                <option value="high">Tinggi</option>
                <option value="critical">Kritis</option>
              </Select>
            </div>
            <Button type="submit" loading={creating}>
              Buat Tiket
            </Button>
          </form>
        </section>

        <section>
          <h2 className="font-semibold">Tiket Saya</h2>
          {tickets === null ? (
            <LoadingState />
          ) : tickets.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="Belum ada tiket" description="Buat tiket untuk menghubungi tim dukungan." />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {tickets.map((t) => (
                <Link key={t.id} href={`/dashboard/tickets/${t.id}`} className="block">
                  <Card className="hover:border-neutral-400 dark:hover:border-neutral-600">
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="font-medium hover:underline">{t.subject}</p>
                        <Badge variant={t.status === 'open' ? 'info' : t.status === 'pending' ? 'warning' : 'success'}>{t.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">{formatDateTime(t.createdAt)} · Prioritas {t.priority}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
