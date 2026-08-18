import type { Metadata } from 'next';
import { getDatastore } from '@/lib/db';
import type { Testimonial } from '@/lib/types';
import { Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Testimoni',
  description: 'Testimoni dari pelanggan WangStore.',
  robots: { index: false },
};

export default async function TestimonialsPage() {
  const store = await getDatastore();
  const testimonials = (await store.list<Testimonial>('testimonials').catch(() => [])).filter((t) => t.published);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Testimoni</h1>
      <p className="mt-2 max-w-2xl text-neutral-500 dark:text-neutral-400">
        Berikut adalah testimoni dari pelanggan WangStore.
      </p>

      {testimonials.length === 0 ? (
        <p className="mt-8 text-neutral-500">Belum ada testimoni untuk ditampilkan.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="card p-5">
              {t.rating ? (
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              ) : null}
              <blockquote className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">“{t.content}”</blockquote>
              <figcaption className="mt-3 text-sm font-medium">
                {t.name}
                {t.role ? <span className="text-neutral-400"> — {t.role}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
