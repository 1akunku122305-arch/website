import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { z } from 'zod';
import { resolveServiceStatus, addDays } from '@/lib/services';
import type { ServiceInstance, ServiceStatus } from '@/lib/types';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.enum(['pending', 'scheduled', 'active', 'suspended', 'expired', 'cancelled', 'terminated']).optional(),
  activationAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  durationDays: z.number().int().min(1).max(730).optional(),
  renewable: z.boolean().optional(),
  manualExtension: z.object({ reason: z.string().min(1).max(500) }).optional(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'services:read');
  if (denied) return denied;
  const store = await getDatastore();
  const service = (await store.get('serviceInstances', params.id)) as ServiceInstance | null;
  if (!service) return fail('not_found', 'Layanan tidak ditemukan.', 404);
  const renewals = (await store.list<import('@/lib/types').ServiceRenewal>('serviceRenewals')).filter((r) => r.serviceId === params.id);
  const reminders = (await store.list<import('@/lib/types').ServiceReminder>('serviceReminders')).filter((r) => r.serviceId === params.id);
  return ok({ service: { ...service, ...resolveServiceStatus(service) }, renewals, reminders });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'services:lifecycle');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data layanan tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data;

  const store = await getDatastore();
  const service = (await store.get('serviceInstances', params.id)) as ServiceInstance | null;
  if (!service) return fail('not_found', 'Layanan tidak ditemukan.', 404);

  const patch: Partial<ServiceInstance> = {};
  const now = new Date().toISOString();
  const old = { activationAt: service.activationAt, expiresAt: service.expiresAt, status: service.status, renewable: service.renewable };
  const metadata: Record<string, unknown> = {};

  if (data.status) {
    patch.status = data.status as ServiceStatus;
    metadata.status = { from: old.status, to: data.status };
  }
  if (data.activationAt) {
    patch.activationAt = data.activationAt;
    metadata.activationAt = { from: old.activationAt, to: data.activationAt };
  }
  if (data.expiresAt) {
    patch.expiresAt = data.expiresAt;
    metadata.expiresAt = { from: old.expiresAt, to: data.expiresAt };
  }
  if (data.durationDays) {
    // Manual extension from current expiration (or now if expired).
    const resolved = resolveServiceStatus(service);
    if (resolved.status === 'expired') {
      patch.activationAt = now;
      patch.expiresAt = addDays(now, data.durationDays);
    } else {
      patch.expiresAt = addDays(service.expiresAt, data.durationDays);
    }
    metadata.durationDays = data.durationDays;
  }
  if (typeof data.renewable === 'boolean') {
    patch.renewable = data.renewable;
    metadata.renewable = { from: old.renewable, to: data.renewable };
  }

  // Manual extension records reason + previous times.
  if (data.manualExtension && (patch.activationAt || patch.expiresAt)) {
    metadata.manualExtension = {
      reason: data.manualExtension.reason,
      previousActivationAt: old.activationAt,
      previousExpirationAt: old.expiresAt,
      newActivationAt: patch.activationAt ?? old.activationAt,
      newExpirationAt: patch.expiresAt ?? old.expiresAt,
    };
  }

  patch.updatedAt = now;
  const updated = await store.update('serviceInstances', params.id, patch as never);

  await writeAudit({
    actorId: guard.session.sub, actorRole: guard.session.role, action: 'service_lifecycle', resource: 'serviceInstances', resourceId: params.id, ip: guard.ip, metadata,
  });
  return ok({ service: updated ? { ...updated, ...resolveServiceStatus(updated as ServiceInstance) } : null });
}
