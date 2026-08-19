export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDatastore } from '@/lib/db';
import type { BlogPost } from '@/lib/types';
import { MarkdownContent } from '@/components/markdown-content';
import { StructuredData } from '@/components/structured-data';
import { APP_URL } from '@/lib/seo';
import { Badge } from '@/components/ui/display';
import { Breadcrumb } from '@/components/ui/navigation';
import { formatDate, readingTime } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: Props) {
  const store = await getDatastore();
  const posts = await store.list<BlogPost>('blogPosts').catch(() => []);
  const post = posts.find((p) => p.slug === params.slug && p.status === 'published');

  if (!post) notFound();

  const related = posts
    .filter((p) => p.status === 'published' && p.id !== post.id && (p.categoryId === post.categoryId || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3);

  return (
    <article className="container-page py-12">
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt ?? undefined,
          author: { '@type': 'Person', name: post.author },
          mainEntityOfPage: `${APP_URL}/blog/${post.slug}`,
        }}
      />
      <Breadcrumb items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{post.author}</span>
          <span>·</span>
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          <span>·</span>
          <span>{readingTime(post.content)} menit baca</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        <MarkdownContent markdown={post.content} className="markdown-body mt-6" />
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-xl font-semibold">Artikel Terkait</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <a key={r.id} href={`/blog/${r.slug}`} className="card p-4 hover:border-neutral-400 dark:hover:border-neutral-600">
                <h3 className="font-medium leading-snug hover:underline">{r.title}</h3>
                <p className="mt-1 text-xs text-neutral-400">{r.author}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getDatastore();
  const posts = await store.list<BlogPost>('blogPosts').catch(() => []);
  const post = posts.find((p) => p.slug === params.slug && p.status === 'published');
  if (!post) return { title: 'Artikel Tidak Ditemukan' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      type: 'article',
    },
  };
}
