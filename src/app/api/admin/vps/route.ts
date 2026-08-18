import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { vpsPackageSchema } from '@/lib/validation/schemas';
import { slugify } from '@/lib/utils';
import type { VpsPackage } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'vps:read');
  if (denied) return denied;
  const store = await getDatastore();
  const packages = (await store.list<VpsPackage>('vpsPackages')).filter((p) => !p.deleted);
  const locations = await store.list('vpsLocations');
  return ok({ packages, locations });
}

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'vps:write');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = vpsPackageSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data paket VPS tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data;

  const store = await getDatastore();
  const now = new Date().toISOString();
  const slug = data.slug || slugify(data.name);
  const existing = (await store.list<VpsPackage>('vpsPackages')).find((p) => p.slug === slug && !p.deleted);
  if (existing) return fail('duplicate', 'Slug paket sudah digunakan.', 409);

  const pkg: VpsPackage = {
    id: generateId('vps'),
    ...data,
    slug,
    description: data.description ?? '',
    features: data.features ?? [],
    createdAt: now,
    updatedAt: now,
  };
  await store.create('vpsPackages', pkg as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'vps_change', resource: 'vpsPackages', resourceId: pkg.id, ip: guard.ip, metadata: { create: true } });
  return ok({ package: pkg }, 201);
}
