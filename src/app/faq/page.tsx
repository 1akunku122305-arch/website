import type { Metadata } from 'next';
import { getDatastore } from '@/lib/db';
import type { FaqItem } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Pertanyaan Umum (FAQ)',
  description: 'Jawaban atas pertanyaan umum tentang WangStore, pemesanan, pembayaran, dan layanan.',
};

export default async function FaqPage() {
  const store = await getDatastore();
  const faqs = (await store.list<FaqItem>('faqItems').catch(() => [])).filter((f) => f.published);

  const grouped = faqs.reduce<Record<string, FaqItem[]>>((acc, f) => {
    const cat = f.category || 'Umum';
    (acc[cat] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Pertanyaan Umum</h1>
      <p className="mt-2 max-w-2xl text-neutral-500 dark:text-neutral-400">
        Jawaban atas pertanyaan yang sering diajukan. Jika tidak ditemukan, hubungi kami melalui kanal yang tersedia.
      </p>

      {Object.keys(grouped).length === 0 ? (
        <p className="mt-8 text-neutral-500">Belum ada FAQ untuk ditampilkan.</p>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} className="mt-8">
            <h2 className="text-xl font-semibold">{cat}</h2>
            <div className="mt-4 space-y-3">
              {items.map((f) => (
                <details key={f.id} className="card p-4">
                  <summary className="cursor-pointer font-medium">{f.question}</summary>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
