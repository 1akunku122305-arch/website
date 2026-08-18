import { getDatastore } from '@/lib/db';
import type { PageDoc } from '@/lib/types';

export async function getPageByKey(key: string): Promise<PageDoc | null> {
  const store = await getDatastore();
  const pages = await store.list<PageDoc>('pages').catch(() => []);
  return pages.find((p) => p.key === key) ?? null;
}

export async function getPageBySlug(slug: string): Promise<PageDoc | null> {
  const store = await getDatastore();
  const pages = await store.list<PageDoc>('pages').catch(() => []);
  return pages.find((p) => p.slug === slug) ?? null;
}
