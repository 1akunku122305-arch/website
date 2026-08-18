import type { Coupon } from '@/lib/types';
import type { TierId } from '@/lib/pricing/tiers';

/**
 * Coupon validation + discount calculation. Server-side only.
 * The client never determines the discount value.
 */

export interface CouponApplicable {
  valid: boolean;
  code?: string;
  reason?: string;
  discount?: number;
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * Validate a coupon and compute the discount for a subtotal and tier.
 * `usageCount` = global usage count; `customerUsageCount` = per-customer usage.
 */
export function applyCoupon(input: {
  coupon: Coupon;
  subtotal: number;
  tier: TierId;
  usageCount: number;
  customerUsageCount: number;
}): CouponApplicable {
  const { coupon, subtotal, tier, usageCount, customerUsageCount } = input;

  if (!coupon.active) {
    return { valid: false, code: coupon.code, reason: 'Kupon tidak aktif.' };
  }
  if (coupon.expiresAt && coupon.expiresAt <= nowIso()) {
    return { valid: false, code: coupon.code, reason: 'Kupon sudah kedaluwarsa.' };
  }
  if (coupon.maxUsage != null && usageCount >= coupon.maxUsage) {
    return { valid: false, code: coupon.code, reason: 'Kupon sudah mencapai batas penggunaan.' };
  }
  if (coupon.maxUsagePerCustomer != null && customerUsageCount >= coupon.maxUsagePerCustomer) {
    return { valid: false, code: coupon.code, reason: 'Kupon sudah digunakan untuk akun ini.' };
  }
  if (coupon.minOrder != null && subtotal < coupon.minOrder) {
    return { valid: false, code: coupon.code, reason: 'Pesanan belum memenuhi jumlah minimum kupon.' };
  }
  if (coupon.applicableTiers && coupon.applicableTiers.length > 0 && !coupon.applicableTiers.includes(tier)) {
    return { valid: false, code: coupon.code, reason: 'Kupon tidak berlaku untuk tier ini.' };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, subtotal); // never discount below zero

  return { valid: true, code: coupon.code, discount };
}
