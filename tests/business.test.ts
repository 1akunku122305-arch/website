import { describe, it, expect } from 'vitest';
import {
  resolveServiceStatus,
  createServiceWindow,
  computeRenewalWindow,
  canRenew,
  remainingDays,
  REMINDER_OFFSETS,
  reminderScheduledAt,
} from '@/lib/services';
import { applyCoupon } from '@/lib/coupons';
import type { Coupon } from '@/lib/types';

const iso = (d: Date) => d.toISOString();
const now = () => new Date();
const past = (ms = 60_000) => new Date(Date.now() - ms);
const future = (ms = 60_000) => new Date(Date.now() + ms);

describe('Service lifecycle (server time)', () => {
  it('activation_at > now → scheduled', () => {
    const s = resolveServiceStatus({ activationAt: iso(future()), expiresAt: iso(future(86400000)), status: 'pending' });
    expect(s.status).toBe('scheduled');
  });

  it('activation_at <= now → active', () => {
    const s = resolveServiceStatus({ activationAt: iso(past()), expiresAt: iso(future(86400000)), status: 'pending' });
    expect(s.status).toBe('active');
  });

  it('expires_at > now → not expired', () => {
    const s = resolveServiceStatus({ activationAt: iso(past()), expiresAt: iso(future(86400000)), status: 'active' as const });
    expect(s.status).not.toBe('expired');
  });

  it('expires_at <= now → expired', () => {
    const s = resolveServiceStatus({ activationAt: iso(past()), expiresAt: iso(past()), status: 'active' as const });
    expect(s.status).toBe('expired');
  });

  it('createServiceWindow with future activation → scheduled; expiration = activation + duration', () => {
    const act = iso(future(3600000));
    const w = createServiceWindow({ activationAt: act, durationDays: 30 });
    expect(w.activationAt).toBe(act);
    const diffDays = (new Date(w.expiresAt).getTime() - new Date(w.activationAt).getTime()) / 86400000;
    expect(diffDays).toBeCloseTo(30);
  });

  it('renewal active service → extends from current expiration', () => {
    const service = { activationAt: iso(past(86400000 * 10)), expiresAt: iso(future(86400000 * 20)), status: 'active' as const };
    const w = computeRenewalWindow(service, 30);
    const diffDays = (new Date(w.expiresAt).getTime() - new Date(service.expiresAt).getTime()) / 86400000;
    expect(diffDays).toBeCloseTo(30);
  });

  it('renewal expired service → starts from server now', () => {
    const service = { activationAt: iso(past(86400000 * 50)), expiresAt: iso(past(86400000 * 20)), status: 'expired' as const };
    const w = computeRenewalWindow(service, 30);
    expect(new Date(w.activationAt).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    const diffDays = (new Date(w.expiresAt).getTime() - new Date(w.activationAt).getTime()) / 86400000;
    expect(diffDays).toBeCloseTo(30);
  });

  it('canRenew respects renewable flag', () => {
    expect(canRenew({ renewable: true, status: 'active' })).toBe(true);
    expect(canRenew({ renewable: false, status: 'active' })).toBe(false);
    expect(canRenew({ renewable: true, status: 'terminated' })).toBe(false);
    expect(canRenew({ renewable: true, status: 'cancelled' })).toBe(false);
  });

  it('remainingDays is non-negative', () => {
    expect(remainingDays({ expiresAt: iso(future(86400000 * 5)) })).toBeGreaterThan(0);
    expect(remainingDays({ expiresAt: iso(past(86400000 * 5)) })).toBe(0);
  });
});

describe('Reminder scheduling', () => {
  it('has default offsets (7d, 3d, 1d, expired)', () => {
    expect(REMINDER_OFFSETS.map((r) => r.type)).toEqual(['expiring_7d', 'expiring_3d', 'expiring_1d', 'expired']);
  });

  it('computes 7-day-before schedule relative to expires_at', () => {
    const expiresAt = '2030-01-10T00:00:00.000Z';
    const s = reminderScheduledAt({ expiresAt }, 'expiring_7d');
    expect(new Date(s).toISOString()).toBe('2030-01-03T00:00:00.000Z');
  });
});

describe('Coupons (server-side)', () => {
  const base: Coupon = {
    id: 'c1', code: 'DISC10', discountType: 'percentage', discountValue: 10,
    active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };

  it('valid coupon → accepted with discount', () => {
    const r = applyCoupon({ coupon: base, subtotal: 100_000, tier: 'low', usageCount: 0, customerUsageCount: 0 });
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(10_000);
  });

  it('expired coupon → rejected', () => {
    const c = { ...base, expiresAt: new Date(Date.now() - 1000).toISOString() };
    const r = applyCoupon({ coupon: c, subtotal: 100_000, tier: 'low', usageCount: 0, customerUsageCount: 0 });
    expect(r.valid).toBe(false);
  });

  it('limit reached → rejected', () => {
    const c = { ...base, maxUsage: 1 };
    const r = applyCoupon({ coupon: c, subtotal: 100_000, tier: 'low', usageCount: 1, customerUsageCount: 0 });
    expect(r.valid).toBe(false);
  });

  it('inactive coupon → rejected', () => {
    const c = { ...base, active: false };
    const r = applyCoupon({ coupon: c, subtotal: 100_000, tier: 'low', usageCount: 0, customerUsageCount: 0 });
    expect(r.valid).toBe(false);
  });

  it('discount never exceeds subtotal (no Rp0/negative)', () => {
    const fixed = { ...base, discountType: 'fixed' as const, discountValue: 500_000 };
    const r = applyCoupon({ coupon: fixed, subtotal: 100_000, tier: 'low', usageCount: 0, customerUsageCount: 0 });
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(100_000);
  });
});
