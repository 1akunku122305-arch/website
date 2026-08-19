export const dynamic = 'force-dynamic';
import { ok } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { VpsPackage, VpsLocation } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const store = await getDatastore();
  const packages = (await store.list<VpsPackage>('vpsPackages')).filter(
    (p) => p.visibility === 'public' && !p.deleted && p.status !== 'inactive',
  );
  const locations = await store.list<VpsLocation>('vpsLocations');
  return ok({
    packages,
    locations: locations.map((l) => ({ id: l.id, name: l.name, country: l.country, city: l.city, status: l.status })),
  });
}
