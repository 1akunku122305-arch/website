'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { BlogCategory, BlogPost } from '@/lib/types';
import { Input, Select } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/display';
import { formatDate } from '@/lib/utils';

export function BlogExplorer({ posts, categories }: { posts: BlogPost[]; categories: BlogCategory[] }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [tag, setTag] = useState('all');

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesQ =
        !query ||
        p.title.toLowerCase().includes(query) ||
        (p.excerpt || '').toLowerCase().includes(query) ||
        (p.content || '').toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        (p.categoryId ? categories.find((c) => c.id === p.categoryId)?.name.toLowerCase().includes(query) : false);
      const matchesCat = category === 'all' || p.categoryId === category;
      const matchesTag = tag === 'all' || p.tags.includes(tag);
      return matchesQ && matchesCat && matchesTag;
    });
  }, [posts, q, category, tag, categories]);

  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            aria-label="Cari artikel"
            className="pl-9"
            placeholder="Cari artikel…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select aria-label="Kategori" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="all">Semua tag</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Tidak ada artikel ditemukan" description="Coba ubah kata kunci pencarian atau filter." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="card group flex flex-col p-5 hover:border-neutral-400 dark:hover:border-neutral-600">
              <h2 className="font-semibold group-hover:underline">{p.title}</h2>
              <p className="mt-1 line-clamp-3 flex-1 text-sm text-neutral-500 dark:text-neutral-400">{p.excerpt}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span>{p.author}</span>
                {p.publishedAt && <span>{formatDate(p.publishedAt)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
