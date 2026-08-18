import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { z } from 'zod';
import type { Coupon } from '@/lib/types';

export const runtime = 'nodejs';

const patchSchema = z.object({
  code: z.string().trim().min(2).max(60).optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().int().min(0).max(100_000_000).optional(),
  minOrder: z.number().int().min(0).optional(),
  expiresAt: z.string().optional().nullable(),
  maxUsage: z.number().int().min(1).optional().nullable(),
  maxUsagePerCustomer: z.number().int().min(1).optional().nullable(),
  active: z.boolean().optional(),
  applicableTiers: z.array(z.enum(['low', 'medium', 'high'])).optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'coupons:write');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data as Record<string, unknown>;

  const store = await getDatastore();
  const coupon = await store.get<Coupon>('coupons', params.id);
  if (!coupon) return fail('not_found', 'Kupon tidak ditemukan.', 404);

  const patch: Record<string, unknown> = {};
  for (const k of Object.keys(data)) {
    const v = (data as never)[k];
    patch[k] = v === null || v === undefined || v === '' ? undefined : v;
  }
  patch.updatedAt = new Date().toISOString();
  const updated = await store.update('coupons', params.id, patch);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'coupon_change', resource: 'coupons', resourceId: params.id, ip: guard.ip, metadata: { fields: Object.keys(patch) } });
  return ok({ coupon: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'coupons:write');
  if (denied) return denied;
  const store = await getDatastore();
  const coupon = await store.get<Coupon>('coupons', params.id);
  if (!coupon) return fail('not_found', 'Kupon tidak ditemukan.', 404);
  // Soft delete.
  await store.update('coupons', params.id, { deleted: true, active: false, updatedAt: new Date().toISOString() } as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'coupon_change', resource: 'coupons', resourceId: params.id, ip: guard.ip, metadata: { deleted: true } });
  return ok({ deleted: true });
}
