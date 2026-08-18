'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea, Label } from '@/components/ui/field';
import { Badge, Card, CardContent, LoadingState, ErrorState } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatDateTime } from '@/lib/utils';
import type { Ticket, TicketMessage } from '@/lib/types';

export default function TicketDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [data, setData] = useState<{ ticket: Ticket; messages: TicketMessage[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/tickets/${params.id}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Gagal memuat.');
      setData(d.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify({ body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Gagal mengirim.');
      setBody('');
      toast('Balasan terkirim.', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal mengirim.', 'error');
    } finally {
      setSending(false);
    }
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!data) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold">{data.ticket.subject}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {formatDateTime(data.ticket.createdAt)} · Prioritas {data.ticket.priority} ·{' '}
        <Badge variant="info">{data.ticket.status}</Badge>
      </p>

      <div className="mt-6 space-y-3">
        {data.messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{m.authorName}</p>
              <p className="text-xs text-neutral-400">{formatDateTime(m.createdAt)}</p>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{m.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={reply} className="mt-6 space-y-3">
        <Label htmlFor="reply">Balas</Label>
        <Textarea id="reply" value={body} onChange={(e) => setBody(e.target.value)} required />
        <Button type="submit" loading={sending}>
          Kirim Balasan
        </Button>
      </form>
    </div>
  );
}
