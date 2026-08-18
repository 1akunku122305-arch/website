/**
 * Processor tiers — single source of truth.
 * Shared between Server Builder UI and API / order pipeline.
 */

export type TierId = 'low' | 'medium' | 'high';

export type TierStatus = 'available' | 'ongoing' | 'maintenance';

export interface ProcessorTier {
  id: TierId;
  label: string;
  /** Display name of the processor family. */
  cpuLabel: string;
  /** Configuration mode: custom (Low) or package (High). */
  mode: 'custom' | 'package';
  status: TierStatus;
  /** Relative performance factor used by the estimation model. */
  perfFactor: number;
}

export const TIERS: Record<TierId, ProcessorTier> = {
  low: {
    id: 'low',
    label: 'Low',
    cpuLabel: 'Intel Xeon E5-2690 v4',
    mode: 'custom',
    status: 'available',
    perfFactor: 0.82,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    cpuLabel: 'Intel Xeon Gold 6138',
    mode: 'package',
    status: 'ongoing',
    perfFactor: 1.0,
  },
  high: {
    id: 'high',
    label: 'High',
    cpuLabel: 'AMD Ryzen 9 9950X',
    mode: 'package',
    status: 'available',
    perfFactor: 1.45,
  },
};

export const TIER_ORDER: TierId[] = ['low', 'medium', 'high'];

export function getTier(id: string): ProcessorTier | null {
  return TIERS[id as TierId] ?? null;
}

export function isTierOrderable(id: string): boolean {
  const tier = getTier(id);
  return tier !== null && tier.status === 'available';
}
