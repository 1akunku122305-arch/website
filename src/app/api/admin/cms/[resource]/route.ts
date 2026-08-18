import { ok, fail, readJson, writeAudit, runRequestGuard, generateId, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { getCmsResource, isAllowedField } from '@/lib/cms/resources';

export const runtime = 'nodejs';

/** Generic CMS list (GET) + create (POST) for a CMS resource. */
export async function GET(_request: Request, { params }: { params: { resource: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const resource = getCmsResource(params.resource);
  if (!resource) return fail('not_found', 'Resource tidak dikenal.', 404);
  const denied = requirePermissionResponse(guard.session.role, resource.readPermission);
  if (denied) return denied;

  const store = await getDatastore();
  const rows = await store.list(resource.collection);
  return ok({ items: rows });
}

export async function POST(request: Request, { params }: { params: { resource: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const resource = getCmsResource(params.resource);
  if (!resource) return fail('not_found', 'Resource tidak dikenal.', 404);
  const denied = requirePermissionResponse(guard.session.role, resource.writePermission);
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = resource.schema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());

  const data = parsed.data as Record<string, unknown>;
  const store = await getDatastore();
  const identity = resource.identityField;

  // Upsert by identity field (e.g. slug/key) to avoid duplicates.
  const all = await store.list(resource.collection);
  const existing = all.find((r) => (r as Record<string, unknown>)[identity] === data[identity]);

  const now = new Date().toISOString();
  if (existing) {
    const patch: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      if (isAllowedField(resource, key)) patch[key] = data[key];
    }
    patch.updatedAt = now;
    await store.update(resource.collection, existing.id, patch);
    await writeAudit({
      actorId: guard.session.sub, actorRole: guard.session.role, action: 'cms_change', resource: resource.auditResource, resourceId: String(existing.id), ip: guard.ip, metadata: { identity: data[identity] },
    });
    return ok({ item: { id: existing.id, ...patch } });
  }

  const item = { id: generateId(resource.key), ...data, createdAt: now, updatedAt: now };
  await store.create(resource.collection, item as never);
  await writeAudit({
    actorId: guard.session.sub, actorRole: guard.session.role, action: 'cms_change', resource: resource.auditResource, resourceId: String(item.id), ip: guard.ip, metadata: { identity: data[identity] },
  });
  return ok({ item }, 201);
}
