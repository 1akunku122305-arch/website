import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { z } from 'zod';
import type { Coupon } from '@/lib/types';

export const runtime = 'nodejs';

const couponSchema = z.object({
  code: z.string().trim().min(2).max(60),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().int().min(0).max(100_000_000),
  minOrder: z.number().int().min(0).optional(),
  expiresAt: z.string().optional().or(z.literal('')),
  maxUsage: z.number().int().min(1).optional(),
  maxUsagePerCustomer: z.number().int().min(1).optional(),
  active: z.boolean().default(true),
  applicableTiers: z.array(z.enum(['low', 'medium', 'high'])).optional(),
});

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'coupons:read');
  if (denied) return denied;
  const store = await getDatastore();
  const coupons = (await store.list<Coupon>('coupons')).filter((c) => !c.deleted);
  return ok({ coupons });
}

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'coupons:write');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data kupon tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data;

  const store = await getDatastore();
  const existing = (await store.list<Coupon>('coupons')).find(
    (c) => c.code.toLowerCase() === data.code.toLowerCase() && !c.deleted,
  );
  if (existing) return fail('duplicate', 'Kode kupon sudah digunakan.', 409);

  const now = new Date().toISOString();
  const coupon: Coupon = {
    id: generateId('cpn'),
    code: data.code.toUpperCase(),
    discountType: data.discountType,
    discountValue: data.discountValue,
    minOrder: data.minOrder,
    expiresAt: data.expiresAt || undefined,
    maxUsage: data.maxUsage,
    maxUsagePerCustomer: data.maxUsagePerCustomer,
    active: data.active,
    applicableTiers: data.applicableTiers,
    createdAt: now,
    updatedAt: now,
  };
  await store.create('coupons', coupon as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'coupon_change', resource: 'coupons', resourceId: coupon.id, ip: guard.ip });
  return ok({ coupon }, 201);
}
