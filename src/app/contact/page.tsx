export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { MessageCircle, Mail, MessageSquare } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';
import { ContactForm } from './contact-form';

export const metadata: Metadata = { title: 'Kontak' };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const channels = [
    { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp || 'Belum dikonfigurasi', configured: Boolean(settings.whatsapp) },
    { icon: MessageSquare, label: 'Discord', value: settings.discord || 'Belum dikonfigurasi', configured: Boolean(settings.discord) },
    { icon: Mail, label: 'Email', value: settings.email || 'Belum dikonfigurasi', configured: Boolean(settings.email) },
  ];

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Hubungi Kami</h1>
      <p className="mt-2 max-w-2xl text-neutral-500 dark:text-neutral-400">
        Gunakan kanal yang tersedia untuk menghubungi WangStore. Konsultasi pra-pembelian disarankan sebelum melakukan pembelian.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {channels.map((c) => (
          <div key={c.label} className="card p-5">
            <c.icon className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
            <h3 className="mt-3 font-semibold">{c.label}</h3>
            <p className="mt-1 break-all text-sm text-neutral-500 dark:text-neutral-400">{c.value}</p>
            {!c.configured && <p className="mt-1 text-xs text-amber-600">Kanal belum dikonfigurasi.</p>}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <h2 className="text-xl font-semibold">Kirim Pesan</h2>
        <ContactForm />
      </div>

    </div>
  );
}
