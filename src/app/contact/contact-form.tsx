'use client';

import { useState } from 'react';
import { Input, Textarea, Label } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/display';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';

export function ContactForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', subject: '', message: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Gagal mengirim pesan.');
        return;
      }
      toast('Pesan berhasil dikirim.', 'success');
      setForm({ name: '', email: '', whatsapp: '', subject: '', message: '' });
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nama</Label>
          <Input id="name" value={form.name} onChange={set('name')} required placeholder="Nama Anda" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="email@contoh.com" />
        </div>
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp (opsional)</Label>
        <Input id="whatsapp" value={form.whatsapp} onChange={set('whatsapp')} placeholder="628xxxxxxxxxx" />
      </div>
      <div>
        <Label htmlFor="subject">Subjek</Label>
        <Input id="subject" value={form.subject} onChange={set('subject')} required placeholder="Subjek pesan" />
      </div>
      <div>
        <Label htmlFor="message">Pesan</Label>
        <Textarea id="message" value={form.message} onChange={set('message')} required placeholder="Tulis pesan Anda" />
      </div>
      <Button type="submit" loading={loading}>
        Kirim Pesan
      </Button>
      <p className="text-xs text-neutral-400">Pesan ini akan dikirim sebagai tiket kepada tim WangStore.</p>
    </form>
  );
}
