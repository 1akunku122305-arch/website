/**
 * Pricing engine — single shared module imported by both UI and API.
 * No separate client/server pricing formulas exist anywhere in the app.
 */

import { normalizeLowConfig, type LowConfig } from './low';
import { getHighPackage } from './packages';
import { getTier, type TierId } from './tiers';
import { lowQuote, highQuote, mediumQuote, type PricingQuote } from './estimate';

export * from './tiers';
export * from './low';
export * from './packages';
export * from './estimate';

export type QuoteError = 'unknown-tier' | 'invalid-package' | 'ongoing';

export interface PricingResult {
  ok: boolean;
  error?: QuoteError;
  orderable: boolean;
  tier: TierId;
  quote: PricingQuote;
}

/**
 * Resolve a full pricing quote for an order from a raw request body.
 * Server-side only: any price supplied by the client is ignored entirely.
 * Client price is never read or used by this function.
 */
export function resolveQuote(input: {
  tier: string;
  cpu?: number;
  ram?: number;
  storage?: number;
  packageId?: string;
  price?: number; // present only to make explicit it is ignored
}): PricingResult {
  const tier = getTier(input.tier);
  if (!tier) {
    return {
      ok: false,
      error: 'unknown-tier',
      orderable: false,
      tier: 'low',
      quote: mediumQuote(),
    };
  }

  if (tier.id === 'low') {
    const config: LowConfig = normalizeLowConfig({
      cpu: input.cpu,
      ram: input.ram,
      storage: input.storage,
    });
    const quote = lowQuote(config);
    return { ok: true, orderable: quote.orderable, tier: tier.id, quote };
  }

  if (tier.id === 'high') {
    const pkg = getHighPackage(input.packageId ?? '');
    if (!pkg) {
      return {
        ok: false,
        error: 'invalid-package',
        orderable: false,
        tier: tier.id,
        quote: highQuote('high-2c4g'),
      };
    }
    const quote = highQuote(pkg.id);
    return { ok: true, orderable: quote.orderable, tier: tier.id, quote };
  }

  // medium
  const quote = mediumQuote();
  return { ok: false, error: 'ongoing', orderable: false, tier: tier.id, quote };
}
