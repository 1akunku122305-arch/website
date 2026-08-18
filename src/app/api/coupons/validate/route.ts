import { z } from 'zod';
import { ok, fail, readJson, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { applyCoupon } from '@/lib/coupons';
import type { Coupon, CouponUsage } from '@/lib/types';

export const runtime = 'nodejs';

const validateSchema = z.object({
  code: z.string().trim().min(1).max(60),
  subtotal: z.number().int().min(0).max(100_000_000),
  tier: z.enum(['low', 'medium', 'high']),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'default' });
  if (guard.error) return guard.error;
  const body = await readJson(request);
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());
  const { code, subtotal, tier, email } = parsed.data;

  const store = await getDatastore();
  const coupon = (await store.list<Coupon>('coupons')).find((c) => c.code.toLowerCase() === code.toLowerCase());
  if (!coupon) return ok({ valid: false, reason: 'Kupon tidak ditemukan.' });

  const usages = await store.list<CouponUsage>('couponUsages');
  const usageCount = usages.filter((u) => u.couponId === coupon.id).length;
  const customerUsageCount = email
    ? usages.filter((u) => u.couponId === coupon.id && u.email?.toLowerCase() === email.toLowerCase()).length
    : 0;

  const result = applyCoupon({ coupon, subtotal, tier, usageCount, customerUsageCount });
  return ok({ valid: result.valid, reason: result.reason, discount: result.discount });
}
