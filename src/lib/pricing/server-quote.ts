import { getDatastore } from '@/lib/db';
import { normalizeLowConfig, lowPrice } from './low';
import { getHighPackage } from './packages';
import { getTier, type TierId } from './tiers';
import { isTierOrderable, getLowFormulaOverride } from './rules';
import { buildEstimate, type PricingQuote } from './estimate';
import type { Package } from '@/lib/types';

/**
 * Server-authoritative quote resolution. Reads effective pricing rules from
 * the database (tier orderability, low formula overrides, medium packages).
 * Client-supplied price is never read.
 */

export interface ServerQuoteResult {
  ok: boolean;
  code: 'ok' | 'unknown-tier' | 'not-orderable' | 'no-package' | 'ongoing';
  message?: string;
  tier: TierId;
  quote: PricingQuote;
  cpu: number;
  ram: number;
  storage: number;
}

export async function resolveServerQuote(input: {
  tier: string;
  cpu?: number;
  ram?: number;
  storage?: number;
  packageId?: string;
}): Promise<ServerQuoteResult> {
  const tier = getTier(input.tier);
  if (!tier) {
    return {
      ok: false, code: 'unknown-tier', tier: 'low',
      quote: fallbackQuote('low'),
      cpu: 2, ram: 4, storage: 20,
    };
  }

  const orderable = await isTierOrderable(tier.id);

  if (tier.id === 'low') {
    const config = normalizeLowConfig({ cpu: input.cpu, ram: input.ram, storage: input.storage });
    const override = await getLowFormulaOverride();
    const price = override
      ? lowPriceWith(config, override)
      : lowPrice(config);
    const quote: PricingQuote = {
      tier: 'low', mode: 'custom', config, price,
      estimate: buildEstimate({ tier: 'low', cpu: config.cpu, ram: config.ram, storage: config.storage }),
      orderable,
    };
    if (!orderable) {
      return { ok: false, code: 'not-orderable', message: 'Tier Low sedang tidak dapat dipesan.', tier: 'low', quote, cpu: config.cpu, ram: config.ram, storage: config.storage };
    }
    return { ok: true, code: 'ok', tier: 'low', quote, cpu: config.cpu, ram: config.ram, storage: config.storage };
  }

  if (tier.id === 'high') {
    const pkg = getHighPackage(input.packageId ?? '');
    const dbPackages = await getDbPackage(tier.id, input.packageId);
    const effective = dbPackages ?? (pkg ? { price: pkg.price, cpu: pkg.cpu, ram: pkg.ram, storage: pkg.storage, id: pkg.id } : null);
    if (!effective) {
      return { ok: false, code: 'no-package', message: 'Paket tidak valid.', tier: 'high', quote: fallbackQuote('high'), cpu: 2, ram: 4, storage: 30 };
    }
    if (!orderable) {
      return { ok: false, code: 'not-orderable', message: 'Tier High sedang tidak dapat dipesan.', tier: 'high', quote: fallbackQuote('high'), cpu: 2, ram: 4, storage: 30 };
    }
    const quote: PricingQuote = {
      tier: 'high', mode: 'package', config: { packageId: input.packageId ?? '' },
      price: effective.price,
      estimate: buildEstimate({ tier: 'high', cpu: effective.cpu, ram: effective.ram, storage: effective.storage }),
      orderable: true,
    };
    return { ok: true, code: 'ok', tier: 'high', quote, cpu: effective.cpu, ram: effective.ram, storage: effective.storage };
  }

  // medium
  if (!orderable) {
    return { ok: false, code: 'ongoing', message: 'Tier Medium sedang dipersiapkan dan belum dapat dipesan.', tier: 'medium', quote: fallbackQuote('medium'), cpu: 4, ram: 8, storage: 40 };
  }
  const pkg = await getDbPackage('medium', input.packageId);
  if (!pkg) {
    return { ok: false, code: 'no-package', message: 'Tidak ada paket Medium yang tersedia.', tier: 'medium', quote: fallbackQuote('medium'), cpu: 4, ram: 8, storage: 40 };
  }
  const quote: PricingQuote = {
    tier: 'medium', mode: 'package', config: { packageId: pkg.id },
    price: pkg.price,
    estimate: buildEstimate({ tier: 'medium', cpu: pkg.cpu, ram: pkg.ram, storage: pkg.storage }),
    orderable: true,
  };
  return { ok: true, code: 'ok', tier: 'medium', quote, cpu: pkg.cpu, ram: pkg.ram, storage: pkg.storage };
}

async function getDbPackage(tier: TierId, packageId?: string) {
  if (!packageId) return null;
  const store = await getDatastore();
  const pkgs = await store.list<Package>('packages');
  const p = pkgs.find((x) => x.id === packageId && x.tier === tier && x.orderable);
  return p ? { id: p.id, price: p.price, cpu: p.cpu, ram: p.ram, storage: p.storage } : null;
}

function lowPriceWith(config: { cpu: number; ram: number; storage: number }, o: NonNullable<Awaited<ReturnType<typeof getLowFormulaOverride>>>): number {
  const base = o.base ?? 5000;
  const perCore = o.perCore ?? 7000;
  const perGbRam = o.perGbRam ?? 4500;
  const perGbStorage = o.perGbStorage ?? 300;
  const roundTo = o.roundTo ?? 500;
  const minPrice = o.minPrice ?? 45000;
  const raw = base + config.cpu * perCore + config.ram * perGbRam + config.storage * perGbStorage;
  return Math.max(Math.ceil(raw / roundTo) * roundTo, minPrice);
}

function fallbackQuote(tier: TierId): PricingQuote {
  if (tier === 'low') {
    const config = normalizeLowConfig({});
    return { tier: 'low', mode: 'custom', config, price: lowPrice(config), estimate: buildEstimate({ tier: 'low', cpu: config.cpu, ram: config.ram, storage: config.storage }), orderable: false };
  }
  if (tier === 'high') {
    const pkg = getHighPackage('high-2c4g')!;
    return { tier: 'high', mode: 'package', config: { packageId: pkg.id }, price: pkg.price, estimate: buildEstimate({ tier: 'high', cpu: pkg.cpu, ram: pkg.ram, storage: pkg.storage }), orderable: false };
  }
  return { tier: 'medium', mode: 'package', config: { packageId: '' }, price: 0, estimate: buildEstimate({ tier: 'medium', cpu: 4, ram: 8, storage: 40 }), orderable: false, unorderableReason: 'Tier Medium sedang dipersiapkan dan belum dapat dipesan.' };
}
