import { TIERS } from './tiers';

/**
 * High tier — fixed packages. Prices are final; there is no region multiplier.
 * Stored in code as the single source of truth for pricing. In production the
 * same rules are seeded into the database `packages` table.
 */

export interface HighPackage {
  id: string;
  tier: 'high';
  cpu: number;
  ram: number;
  storage: number;
  /** Monthly price in IDR. */
  price: number;
  label: string;
  popular: boolean;
  cpuLabel: string;
  orderable: boolean;
}

export const HIGH_PACKAGES: readonly HighPackage[] = [
  { id: 'high-2c4g', tier: 'high', cpu: 2, ram: 4, storage: 30, price: 300_000, label: '2 core · 4 GB · 30 GB', popular: false, cpuLabel: TIERS.high.cpuLabel, orderable: true },
  { id: 'high-3c6g', tier: 'high', cpu: 3, ram: 6, storage: 40, price: 420_000, label: '3 core · 6 GB · 40 GB', popular: false, cpuLabel: TIERS.high.cpuLabel, orderable: true },
  { id: 'high-4c8g', tier: 'high', cpu: 4, ram: 8, storage: 50, price: 600_000, label: '4 core · 8 GB · 50 GB', popular: true, cpuLabel: TIERS.high.cpuLabel, orderable: true },
  { id: 'high-6c12g', tier: 'high', cpu: 6, ram: 12, storage: 60, price: 850_000, label: '6 core · 12 GB · 60 GB', popular: false, cpuLabel: TIERS.high.cpuLabel, orderable: true },
  { id: 'high-8c16g', tier: 'high', cpu: 8, ram: 16, storage: 70, price: 1_100_000, label: '8 core · 16 GB · 70 GB', popular: false, cpuLabel: TIERS.high.cpuLabel, orderable: true },
  { id: 'high-10c32g', tier: 'high', cpu: 10, ram: 32, storage: 110, price: 2_100_000, label: '10 core · 32 GB · 110 GB', popular: false, cpuLabel: TIERS.high.cpuLabel, orderable: true },
];

export const HIGH_PACKAGE_MAP: ReadonlyMap<string, HighPackage> = new Map(
  HIGH_PACKAGES.map((p) => [p.id, p]),
);

export function getHighPackage(id: string): HighPackage | null {
  return HIGH_PACKAGE_MAP.get(id) ?? null;
}

/** High package price is final (no multiplier). */
export function highPrice(pkg: HighPackage): number {
  return pkg.price;
}
