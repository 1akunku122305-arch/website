import { ok } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { Package } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const store = await getDatastore();
  const packages = (await store.list<Package>('packages')).filter((p) => p.orderable);
  return ok({ packages });
}
