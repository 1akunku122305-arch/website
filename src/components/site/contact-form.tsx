"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button, Card, Field } from "@/components/ui";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormState = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sending, setSending] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = "Nama minimal 2 karakter.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Email tidak valid.";
    if (form.subject.trim().length < 3) next.subject = "Subjek minimal 3 karakter.";
    if (form.message.trim().length < 10) next.message = "Pesan minimal 10 karakter.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSending(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.ok) {
        setTicketId(json.data.ticketId as string);
        setForm(EMPTY);
      } else {
        setServerError(json.error as string);
      }
    } catch {
      setServerError("Gagal mengirim pesan. Periksa koneksi Anda atau hubungi kami via WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  if (ticketId) {
    return (
      <Card className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#c3ff3e]" strokeWidth={2.4} />
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-black">Tiket terkirim</h2>
        <p className="mt-2 text-sm text-[#a99fc8]">
          Nomor tiket Anda: <strong className="text-[#c3ff3e]">{ticketId}</strong>. Simpan nomor ini untuk menanyakan
          perkembangan. Tim kami membalas rata-rata di bawah 10 menit.
        </p>
        <Button className="mt-6" variant="secondary" onClick={() => setTicketId(null)}>
          Kirim pesan lain
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-black">Kirim tiket dukungan</h2>
      <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama" htmlFor="c-name" error={errors.name}>
            <input
              id="c-name"
              className="input"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Email" htmlFor="c-email" error={errors.email}>
            <input
              id="c-email"
              type="email"
              className="input"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Subjek" htmlFor="c-subject" error={errors.subject}>
          <input
            id="c-subject"
            className="input"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </Field>
        <Field label="Pesan" htmlFor="c-message" error={errors.message}>
          <textarea
            id="c-message"
            rows={6}
            className="input resize-y"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </Field>

        {serverError ? <p className="text-sm font-bold text-[#fb7185]">{serverError}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={sending}>
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          Kirim Tiket
        </Button>
      </form>
    </Card>
  );
}
