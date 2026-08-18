import { z } from 'zod';
import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { getCmsResource, isAllowedField } from '@/lib/cms/resources';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { resource: string; id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const resource = getCmsResource(params.resource);
  if (!resource) return fail('not_found', 'Resource tidak dikenal.', 404);
  const denied = requirePermissionResponse(guard.session.role, resource.readPermission);
  if (denied) return denied;

  const store = await getDatastore();
  const item = await store.get(resource.collection, params.id);
  if (!item) return fail('not_found', 'Item tidak ditemukan.', 404);
  return ok({ item });
}

export async function PATCH(request: Request, { params }: { params: { resource: string; id: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const resource = getCmsResource(params.resource);
  if (!resource) return fail('not_found', 'Resource tidak dikenal.', 404);
  const denied = requirePermissionResponse(guard.session.role, resource.writePermission);
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = (resource.schema as z.ZodObject<Record<string, z.ZodTypeAny>>).partial().safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());

  const data = parsed.data as Record<string, unknown>;
  const store = await getDatastore();
  const existing = await store.get(resource.collection, params.id);
  if (!existing) return fail('not_found', 'Item tidak ditemukan.', 404);

  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (isAllowedField(resource, key)) patch[key] = data[key];
  }
  patch.updatedAt = new Date().toISOString();
  const updated = await store.update(resource.collection, params.id, patch);
  await writeAudit({
    actorId: guard.session.sub, actorRole: guard.session.role, action: 'cms_change', resource: resource.auditResource, resourceId: params.id, ip: guard.ip, metadata: { fields: Object.keys(patch) },
  });
  return ok({ item: updated });
}

export async function DELETE(_request: Request, { params }: { params: { resource: string; id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const resource = getCmsResource(params.resource);
  if (!resource) return fail('not_found', 'Resource tidak dikenal.', 404);
  const denied = requirePermissionResponse(guard.session.role, resource.writePermission);
  if (denied) return denied;

  const store = await getDatastore();
  await store.delete(resource.collection, params.id);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'delete', resource: resource.auditResource, resourceId: params.id, ip: guard.ip });
  return ok({ deleted: true });
}
