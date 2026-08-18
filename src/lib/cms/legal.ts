import { getDatastore } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';

export async function getLegalDoc(slug: string): Promise<LegalDocument | null> {
  const store = await getDatastore();
  const docs = await store.list<LegalDocument>('legalDocuments').catch(() => []);
  return docs.find((d) => d.slug === slug) ?? null;
}
