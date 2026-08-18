import Link from 'next/link';
import { ArrowRight, Server, ShieldCheck, Zap, CreditCard, LifeBuoy, Boxes } from 'lucide-react';
import { getPageByKey } from '@/lib/cms/pages';
import { getDatastore } from '@/lib/db';
import { MarkdownContent } from '@/components/markdown-content';
import { TIERS, TIER_ORDER } from '@/lib/pricing/tiers';
import { lowMinimumPrice } from '@/lib/pricing/low';
import { HIGH_PACKAGES } from '@/lib/pricing/packages';
import { formatRupiah } from '@/lib/utils';
import type { FaqItem, Product } from '@/lib/types';
import { StructuredData } from '@/components/structured-data';
import { APP_URL, SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: 'WangStore — Build Your Own Server.',
  description: 'Platform penjualan dan pengelolaan layanan hosting. Konfigurasi server, lihat harga real-time, dan kelola layanan Anda.',
};

export default async function HomePage() {
  const [page, store] = await Promise.all([getPageByKey('home'), getDatastore()]);
  const products = await store.list<Product>('products').catch(() => []);
  const faqs = (await store.list<FaqItem>('faqItems').catch(() => [])).filter((f) => f.published).slice(0, 4);
  const highPreview = HIGH_PACKAGES.slice(0, 3);

  return (
    <div>
      <StructuredData
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: APP_URL,
            description: 'Platform penjualan dan pengelolaan layanan hosting.',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          },
        ]}
      />
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container-page py-20 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Build Your Own Server.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
            Pilih layanan, konfigurasi kebutuhan Anda dengan Server Builder, dan kelola semuanya dari satu dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/server-builder" className="btn btn-primary">
              Buat Server <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/vps" className="btn btn-secondary">
              Lihat Paket
            </Link>
          </div>
          <p className="mt-6 text-sm text-neutral-400 dark:text-neutral-500">
            Harga mulai dari {formatRupiah(lowMinimumPrice())}/bulan — transparan, dihitung server-side.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Layanan Kami</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Server, title: 'Minecraft Hosting', desc: 'Jalankan server Minecraft komunitas Anda.' },
            { icon: Boxes, title: 'VPS', desc: 'Server virtual dengan kendali penuh.' },
            { icon: CreditCard, title: 'Dedicated Server', desc: 'Sumber daya khusus untuk beban kerja berat.' },
            { icon: LifeBuoy, title: 'Panel Hosting', desc: 'Kelola server Anda dengan mudah.' },
          ].map((s) => (
            <div key={s.title} className="card p-6">
              <s.icon className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {products.length > 0 ? `Katalog: ${products.map((p) => p.name).join(' · ')}` : ''}
        </p>
      </section>

      {/* Tiers */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container-page">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Processor Tiers</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-500 dark:text-neutral-400">
            Pilih tier yang sesuai. Low untuk konfigurasi custom, High untuk paket tetap. Medium sedang dipersiapkan.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TIER_ORDER.map((id) => {
              const t = TIERS[id];
              const ongoing = t.status !== 'available';
              return (
                <div key={id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.label}</h3>
                    {ongoing && <span className="text-xs font-medium text-amber-600">Ongoing</span>}
                  </div>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.cpuLabel}</p>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                    {t.mode === 'custom' ? 'Konfigurasi custom (CPU, RAM, Penyimpanan)' : 'Paket tetap'}
                  </p>
                  {ongoing ? (
                    <p className="mt-4 text-sm text-amber-600">Paket belum tersedia untuk pemesanan.</p>
                  ) : (
                    <Link href="/server-builder" className="btn btn-secondary mt-4 w-full">
                      Pilih {t.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Server Builder CTA */}
      <section className="container-page py-16">
        <div className="card flex flex-col items-center gap-6 p-8 text-center sm:p-12">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <Zap className="h-5 w-5" />
            <span className="font-medium">Server Builder</span>
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">Konfigurasi server Anda dalam hitungan menit</h2>
          <p className="max-w-2xl text-neutral-500 dark:text-neutral-400">
            Pilih tier, atur CPU/RAM/penyimpanan, dan lihat harga real-time beserta estimasi performa sebelum memesan.
          </p>
          <Link href="/server-builder" className="btn btn-primary">
            Buka Server Builder <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* High packages preview */}
      <section className="container-page pb-16">
        <h2 className="text-center text-2xl font-bold">Paket High</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highPreview.map((p) => (
            <div key={p.id} className="card p-6">
              <p className="text-sm font-semibold">
                {p.cpu} core · {p.ram} GB · {p.storage} GB
              </p>
              <p className="mt-2 text-xl font-bold">{formatRupiah(p.price)}</p>
              <p className="text-xs text-neutral-500">per bulan</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/server-builder" className="text-sm font-medium text-neutral-700 underline hover:text-neutral-900 dark:text-neutral-200">
            Lihat semua paket
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container-page">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Cara Kerja</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { n: '1', title: 'Pilih & Konfigurasi', desc: 'Pilih layanan dan atur spesifikasi melalui Server Builder.' },
              { n: '2', title: 'Pesan', desc: 'Isi informasi dan buat order. Harga dihitung server-side.' },
              { n: '3', title: 'Kelola', desc: 'Selesaikan pemesanan dan kelola layanan dari dashboard pelanggan.' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      {faqs.length > 0 && (
        <section className="container-page py-16">
          <h2 className="text-center text-2xl font-bold">Pertanyaan Umum</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-4">
            {faqs.map((f) => (
              <div key={f.id} className="card p-4">
                <h3 className="font-semibold">{f.question}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{f.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/faq" className="text-sm font-medium text-neutral-700 underline hover:text-neutral-900 dark:text-neutral-200">
              Lihat semua FAQ
            </Link>
          </div>
        </section>
      )}

      {/* Trust / CTA */}
      <section className="container-page pb-20">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Keamanan &amp; privasi</span>
          <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Harga real-time</span>
          <span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4" /> Dukungan</span>
        </div>
      </section>

      {page && <MarkdownContent markdown={page.content} className="container-page pb-20" />}
    </div>
  );
}
