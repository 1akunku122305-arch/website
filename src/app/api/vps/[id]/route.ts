import { ok, fail } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { VpsPackage, VpsLocation } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const store = await getDatastore();
  const pkg = await store.get<VpsPackage>('vpsPackages', params.id);
  if (!pkg || pkg.visibility !== 'public' || pkg.deleted || pkg.status === 'inactive') {
    return fail('not_found', 'Paket VPS tidak ditemukan.', 404);
  }
  const location = pkg.locationId ? await store.get<VpsLocation>('vpsLocations', pkg.locationId) : null;
  return ok({ package: { ...pkg, location } });
}
