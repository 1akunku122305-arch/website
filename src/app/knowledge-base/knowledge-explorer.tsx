'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { KnowledgeArticle } from '@/lib/types';
import { Input } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/display';

const DEFAULT_CATEGORIES = [
  'Memulai', 'Pemesanan', 'Pembayaran', 'Minecraft', 'Server', 'Troubleshooting', 'Akun', 'Kebijakan',
];

export function KnowledgeExplorer({ articles }: { articles: KnowledgeArticle[] }) {
  const [q, setQ] = useState('');

  const categories = useMemo(() => {
    const present = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    const order = [...DEFAULT_CATEGORIES, ...present.filter((p) => !DEFAULT_CATEGORIES.includes(p))];
    return Array.from(new Set(order));
  }, [articles]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return articles.filter(
      (a) =>
        !query ||
        a.title.toLowerCase().includes(query) ||
        (a.excerpt || '').toLowerCase().includes(query) ||
        (a.content || '').toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query)),
    );
  }, [articles, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, KnowledgeArticle[]>();
    for (const a of filtered) {
      const cat = a.category || 'Umum';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    }
    return categories.filter((c) => map.has(c)).map((c) => ({ category: c, items: map.get(c)! }));
  }, [filtered, categories]);

  return (
    <div className="mt-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input aria-label="Cari artikel" className="pl-9" placeholder="Cari di knowledge base…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Tidak ada artikel ditemukan" description="Coba gunakan kata kunci lain." />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {grouped.map((g) => (
            <section key={g.category}>
              <h2 className="text-lg font-semibold">{g.category}</h2>
              <ul className="mt-3 space-y-2">
                {g.items.map((a) => (
                  <li key={a.id}>
                    <Link href={`/knowledge-base/${a.slug}`} className="card block p-4 hover:border-neutral-400 dark:hover:border-neutral-600">
                      <span className="font-medium hover:underline">{a.title}</span>
                      {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{a.excerpt}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
