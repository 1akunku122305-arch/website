export const dynamic = 'force-dynamic';
import type { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/seo';
import { getDatastore } from '@/lib/db';
import type { BlogPost, KnowledgeArticle } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/about', '/infrastructure', '/server-builder', '/features', '/why-wangstore',
    '/faq', '/testimonials', '/blog', '/knowledge-base', '/status', '/contact',
    '/terms', '/privacy', '/refund', '/sla', '/acceptable-use', '/cookie-policy', '/vps',
  ];
  const base = APP_URL;

  const entries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  try {
    const store = await getDatastore();
    const posts = await store.list<BlogPost>('blogPosts').catch(() => []);
    for (const p of posts.filter((x) => x.status === 'published')) {
      entries.push({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.6 });
    }
    const articles = await store.list<KnowledgeArticle>('knowledgeArticles').catch(() => []);
    for (const a of articles.filter((x) => x.status === 'published')) {
      entries.push({ url: `${base}/knowledge-base/${a.slug}`, lastModified: a.updatedAt, changeFrequency: 'monthly', priority: 0.5 });
    }
  } catch {
    // sitemap tetap valid dengan halaman statis
  }

  return entries;
}
