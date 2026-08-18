import { describe, it, expect } from 'vitest';
import {
  lowPrice,
  normalizeLowConfig,
  highPrice,
  getHighPackage,
  resolveQuote,
  HIGH_PACKAGES,
} from '@/lib/pricing';
import { buildEstimate } from '@/lib/pricing/estimate';

describe('High tier fixed packages', () => {
  it.each([
    ['high-2c4g', 300_000],
    ['high-3c6g', 420_000],
    ['high-4c8g', 600_000],
    ['high-6c12g', 850_000],
    ['high-8c16g', 1_100_000],
    ['high-10c32g', 2_100_000],
  ])('%s → Rp%s', (id, expected) => {
    const pkg = getHighPackage(id);
    expect(pkg).not.toBeNull();
    expect(highPrice(pkg!)).toBe(expected);
  });

  it('High prices are final (no multiplier)', () => {
    for (const p of HIGH_PACKAGES) {
      expect(highPrice(p)).toBe(p.price);
    }
  });
});

describe('Low tier pricing formula', () => {
  it('minimum config 2 core / 4 GB / 20 GB → 45000', () => {
    const price = lowPrice({ cpu: 2, ram: 4, storage: 20 });
    expect(price).toBe(45_000);
  });

  it('normalizes overflow config (20/64/900) → (16/32/160)', () => {
    const n = normalizeLowConfig({ cpu: 20, ram: 64, storage: 900 });
    expect(n.cpu).toBe(16);
    expect(n.ram).toBe(32);
    expect(n.storage).toBe(160);
  });

  it('normalizes low values to minimums', () => {
    const n = normalizeLowConfig({ cpu: 0, ram: 0, storage: 0 });
    expect(n.cpu).toBe(2);
    expect(n.ram).toBe(4);
    expect(n.storage).toBe(20);
  });

  it('rounds up to Rp500', () => {
    // e.g. 2 core / 4 GB / 21 GB (not step-valid) clamped to 20 → 45000
    const n = normalizeLowConfig({ cpu: 2, ram: 4, storage: 21 });
    expect(n.storage).toBe(20);
    expect(lowPrice(n)).toBe(45_000);
  });

  it('rejects config above absolute max storage 160', () => {
    const n = normalizeLowConfig({ cpu: 8, ram: 16, storage: 900 });
    expect(n.storage).toBe(160);
    expect(n.storage).toBeLessThanOrEqual(160);
  });
});

describe('resolveQuote', () => {
  it('rejects unknown tier', () => {
    const r = resolveQuote({ tier: 'ultra' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('unknown-tier');
  });

  it('rejects fake high package', () => {
    const r = resolveQuote({ tier: 'high', packageId: 'fake' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid-package');
  });

  it('marks medium as ongoing and never Rp0 for orders', () => {
    const r = resolveQuote({ tier: 'medium' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('ongoing');
    expect(r.orderable).toBe(false);
  });

  it('computes low price server-side regardless of client price', () => {
    const r = resolveQuote({ tier: 'low', cpu: 2, ram: 4, storage: 20, price: 0 });
    expect(r.ok).toBe(true);
    expect(r.quote.price).toBe(45_000);
  });
});

describe('estimation model', () => {
  it('is deterministic', () => {
    const a = buildEstimate({ tier: 'low', cpu: 4, ram: 8, storage: 40 });
    const b = buildEstimate({ tier: 'low', cpu: 4, ram: 8, storage: 40 });
    expect(a).toEqual(b);
  });

  it('respects tier perf factor (high > low for same specs)', () => {
    const low = buildEstimate({ tier: 'low', cpu: 4, ram: 8, storage: 40 });
    const high = buildEstimate({ tier: 'high', cpu: 4, ram: 8, storage: 40 });
    expect(high.tps).toBeGreaterThanOrEqual(low.tps);
  });
});
