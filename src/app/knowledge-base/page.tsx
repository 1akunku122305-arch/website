import type { Metadata } from 'next';
import { getDatastore } from '@/lib/db';
import type { KnowledgeArticle } from '@/lib/types';
import { KnowledgeExplorer } from './knowledge-explorer';

export const metadata: Metadata = {
  title: 'Knowledge Base',
  description: 'Panduan dan tutorial menggunakan WangStore.',
};

export default async function KnowledgeBasePage() {
  const store = await getDatastore();
  const articles = (await store.list<KnowledgeArticle>('knowledgeArticles').catch(() => [])).filter(
    (a) => a.status === 'published',
  );
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Knowledge Base</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">Panduan dan tutorial untuk membantu Anda menggunakan WangStore.</p>
      <KnowledgeExplorer articles={articles} />
    </div>
  );
}
