import Link from 'next/link';
import { Server } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';
import { isWhatsappConfigured } from '@/lib/whatsapp';

const MAIN_LINKS = [
  { href: '/server-builder', label: 'Server Builder' },
  { href: '/features', label: 'Fitur' },
  { href: '/why-wangstore', label: 'Mengapa WangStore' },
  { href: '/infrastructure', label: 'Infrastruktur' },
  { href: '/testimonials', label: 'Testimoni' },
];

const RESOURCE_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/knowledge-base', label: 'Knowledge Base' },
  { href: '/faq', label: 'FAQ' },
  { href: '/status', label: 'Status Layanan' },
  { href: '/contact', label: 'Kontak' },
];

const LEGAL_LINKS = [
  { href: '/terms', label: 'Syarat & Ketentuan' },
  { href: '/privacy', label: 'Kebijakan Privasi' },
  { href: '/refund', label: 'Kebijakan Refund' },
  { href: '/sla', label: 'SLA' },
  { href: '/acceptable-use', label: 'Kebijakan Penggunaan' },
  { href: '/cookie-policy', label: 'Kebijakan Cookie' },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const whatsappConfigured = isWhatsappConfigured();
  const contact = settings.whatsapp || settings.email || settings.discord;

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black">
              <Server className="h-5 w-5" />
            </span>
            {settings.siteName}
          </div>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{settings.tagline}</p>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Platform penjualan dan pengelolaan layanan hosting.
          </p>
        </div>

        <nav aria-label="Tautan utama">
          <h3 className="mb-3 text-sm font-semibold">Layanan</h3>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            {MAIN_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-neutral-900 dark:hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Sumber daya">
          <h3 className="mb-3 text-sm font-semibold">Sumber Daya</h3>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-neutral-900 dark:hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Hukum">
          <h3 className="mb-3 text-sm font-semibold">Legal</h3>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-neutral-900 dark:hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-neutral-200 py-6 dark:border-neutral-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-sm text-neutral-500 dark:text-neutral-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.siteName}. Hak cipta dilindungi.</p>
          <p className="flex items-center gap-2">
            {whatsappConfigured ? (
              <span>WhatsApp tersedia</span>
            ) : (
              <span>Kontak: {contact || 'belum dikonfigurasi'}</span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
