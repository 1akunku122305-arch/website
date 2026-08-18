import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { vpsPackageSchema } from '@/lib/validation/schemas';
import { slugify } from '@/lib/utils';
import type { VpsPackage } from '@/lib/types';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'vps:write');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = vpsPackageSchema.partial().safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data paket VPS tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data as Partial<VpsPackage>;

  const store = await getDatastore();
  const existing = await store.get<VpsPackage>('vpsPackages', params.id);
  if (!existing) return fail('not_found', 'Paket tidak ditemukan.', 404);

  const patch: Partial<VpsPackage> = { ...data };
  if (data.name && !data.slug) patch.slug = slugify(data.name);
  patch.updatedAt = new Date().toISOString();
  const updated = await store.update('vpsPackages', params.id, patch as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'vps_change', resource: 'vpsPackages', resourceId: params.id, ip: guard.ip, metadata: { fields: Object.keys(patch) } });
  return ok({ package: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'vps:write');
  if (denied) return denied;
  const store = await getDatastore();
  const existing = await store.get<VpsPackage>('vpsPackages', params.id);
  if (!existing) return fail('not_found', 'Paket tidak ditemukan.', 404);
  // Soft archive.
  await store.update('vpsPackages', params.id, { deleted: true, status: 'inactive', updatedAt: new Date().toISOString() } as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'vps_change', resource: 'vpsPackages', resourceId: params.id, ip: guard.ip, metadata: { deleted: true } });
  return ok({ deleted: true });
}
