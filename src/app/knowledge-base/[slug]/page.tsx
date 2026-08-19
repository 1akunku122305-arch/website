export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDatastore } from '@/lib/db';
import type { KnowledgeArticle } from '@/lib/types';
import { MarkdownContent } from '@/components/markdown-content';
import { Badge } from '@/components/ui/display';
import { Breadcrumb } from '@/components/ui/navigation';

interface Props {
  params: { slug: string };
}

export default async function KnowledgeArticlePage({ params }: Props) {
  const store = await getDatastore();
  const articles = await store.list<KnowledgeArticle>('knowledgeArticles').catch(() => []);
  const article = articles.find((a) => a.slug === params.slug && a.status === 'published');
  if (!article) notFound();

  const related = articles
    .filter((a) => a.status === 'published' && a.id !== article.id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, 3);

  return (
    <article className="container-page py-12">
      <Breadcrumb items={[{ label: 'Knowledge Base', href: '/knowledge-base' }, { label: article.title }]} />
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap gap-1.5">
          <Badge>{article.category}</Badge>
          {article.tags.map((t) => (
            <Badge key={t} variant="neutral">
              {t}
            </Badge>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight">{article.title}</h1>
        <MarkdownContent markdown={article.content} className="markdown-body mt-6" />
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-xl font-semibold">Artikel Terkait</h2>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <a href={`/knowledge-base/${r.slug}`} className="card block p-4 hover:border-neutral-400 dark:hover:border-neutral-600">
                  <span className="font-medium hover:underline">{r.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getDatastore();
  const articles = await store.list<KnowledgeArticle>('knowledgeArticles').catch(() => []);
  const article = articles.find((a) => a.slug === params.slug && a.status === 'published');
  if (!article) return { title: 'Artikel Tidak Ditemukan' };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: 'article' },
  };
}
