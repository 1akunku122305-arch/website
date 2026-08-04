"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Post } from "@/lib/types";
import { Badge, Card } from "@/components/ui";
import { cn, formatDate, readingTime } from "@/lib/utils";

export function BlogIndex({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [tag, setTag] = useState<string | null>(null);

  const categories = useMemo(() => ["Semua", ...new Set(posts.map((p) => p.category))], [posts]);
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))], [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== "Semua" && p.category !== category) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
      );
    });
  }, [posts, query, category, tag]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6690]" />
          <input
            type="search"
            className="input pl-11"
            placeholder="Cari artikel, misal: TPS, Paper, DDoS…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari artikel blog"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full border-2 border-black px-4 py-1.5 text-xs font-black uppercase tracking-wide shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5",
                category === c ? "bg-[#c3ff3e] text-black" : "bg-[#1b1233] text-[#cdc3ea]",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="label">Tag</span>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(tag === t ? null : t)}
              aria-pressed={tag === t}
              className={cn(
                "rounded-full border-2 border-black px-3 py-1 text-[11px] font-bold transition-transform hover:-translate-y-0.5",
                tag === t ? "bg-[#a855f7] text-black" : "bg-[#150f28] text-[#8d83ad]",
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#8d83ad]">
        {filtered.length} artikel ditemukan
      </p>

      {filtered.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="font-black">Tidak ada artikel yang cocok.</p>
          <p className="mt-2 text-sm text-[#a99fc8]">Coba kata kunci lain atau hapus filter kategori dan tag.</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.slug} as="article" className="brut-hover flex h-full flex-col">
              <div className="flex items-center gap-2">
                <Badge tone="muted">{p.category}</Badge>
                <span className="text-[11px] text-[#8d83ad]">{readingTime(p.body)} menit baca</span>
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-black leading-snug">
                <Link href={`/blog/${p.slug}`} className="hover:text-[#c3ff3e]">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#a99fc8]">{p.excerpt}</p>
              <div className="mt-4 flex items-center justify-between border-t-2 border-[#241645] pt-3 text-[11px] text-[#8d83ad]">
                <span>{p.author}</span>
                <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
