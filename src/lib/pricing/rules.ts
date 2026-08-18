import { getDatastore } from '@/lib/db';
import { TIERS, type TierId } from './tiers';

/**
 * Server-side pricing rules loaded from the database (pricing_rules).
 * Used by the order API to determine effective tier orderability and any
 * low-tier formula overrides. Falls back to the code-defined constants.
 * Client UI uses the same code constants; the server is authoritative.
 */

export type TierRuleStatus = 'available' | 'ongoing' | 'maintenance';

export interface PricingRule {
  id: string;
  tier: string;
  type?: 'custom' | 'package';
  status?: TierRuleStatus;
  active?: boolean;
  base?: number;
  perCore?: number;
  perGbRam?: number;
  perGbStorage?: number;
  roundTo?: number;
  minPrice?: number;
}

export async function getTierRule(tier: TierId): Promise<PricingRule | null> {
  const store = await getDatastore();
  const rules = await store.list<PricingRule>('pricingRules').catch(() => []);
  return rules.find((r) => r.tier === tier) ?? null;
}

export async function isTierOrderable(tier: TierId): Promise<boolean> {
  const rule = await getTierRule(tier);
  if (rule && rule.status) {
    return rule.status === 'available';
  }
  return TIERS[tier].status === 'available';
}

export async function getLowFormulaOverride(): Promise<Partial<{
  base: number; perCore: number; perGbRam: number; perGbStorage: number; roundTo: number; minPrice: number;
}> | null> {
  const rule = await getTierRule('low');
  if (!rule) return null;
  const hasAny = [rule.base, rule.perCore, rule.perGbRam, rule.perGbStorage, rule.roundTo, rule.minPrice].some(
    (v) => typeof v === 'number',
  );
  if (!hasAny) return null;
  return {
    base: rule.base,
    perCore: rule.perCore,
    perGbRam: rule.perGbRam,
    perGbStorage: rule.perGbStorage,
    roundTo: rule.roundTo,
    minPrice: rule.minPrice,
  };
}
