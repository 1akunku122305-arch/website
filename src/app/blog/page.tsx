export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { getDatastore } from '@/lib/db';
import type { BlogCategory, BlogPost } from '@/lib/types';
import { BlogExplorer } from './blog-explorer';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artikel, panduan, dan pengumuman dari WangStore.',
};

export default async function BlogPage() {
  const store = await getDatastore();
  const [posts, categories] = await Promise.all([
    store.list<BlogPost>('blogPosts').catch(() => []),
    store.list<BlogCategory>('blogCategories').catch(() => []),
  ]);
  const published = posts.filter((p) => p.status === 'published');

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">Artikel, panduan, dan pengumuman dari tim WangStore.</p>
      <BlogExplorer posts={published} categories={categories} />
    </div>
  );
}
