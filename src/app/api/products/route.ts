export const dynamic = 'force-dynamic';
import { ok } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { Product } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const store = await getDatastore();
  const products = (await store.list<Product>('products')).filter((p) => p.status === 'active' && p.visibility === 'public');
  return ok({ products });
}
