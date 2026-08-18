import { TIERS, type TierId } from './tiers';
import { LOW_CONFIG, lowPrice, type LowConfig } from './low';
import { getHighPackage } from './packages';

/**
 * Deterministic, shared estimation model.
 * Uses ONLY configuration data that actually exists (tier, cpu, ram, storage),
 * scaled by the tier performance factor. No software/version/panel inputs.
 *
 * All values are labelled "Estimasi" — never presented as an SLA or guarantee.
 */

export type BuildGrade = 'S' | 'A' | 'B' | 'C';

export interface BuildEstimate {
  /** Estimated TPS (ticks per second), capped at 20. */
  tps: number;
  /** Estimated concurrent players. */
  concurrentPlayers: number;
  /** Estimated steady-state CPU load percentage. */
  cpuLoadPercent: number;
  /** Estimated RAM usage in GB at steady state. */
  ramUsageGb: number;
  /** Recommended plugin count range. */
  plugins: { min: number; max: number };
  grade: BuildGrade;
}

export interface EstimateInput {
  tier: TierId;
  cpu: number;
  ram: number;
  storage: number;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Compute a deterministic estimate from a validated configuration. */
export function buildEstimate(input: EstimateInput): BuildEstimate {
  const tier = TIERS[input.tier];
  const perf = tier.perfFactor;
  const cpu = input.cpu;
  const ram = input.ram;
  const storage = input.storage;

  // Effective compute power = vCore count scaled by tier performance factor.
  const effCpu = cpu * perf;

  // Estimated TPS — a busy server typically runs 10-20 TPS.
  let tps = 9 + effCpu * 0.9;
  tps = Math.min(tps, 20);
  tps = round1(tps);

  // Estimated concurrent players: driven mostly by CPU, capped by RAM.
  const cpuPlayers = effCpu * 18;
  const ramPlayers = (ram - 2) * 6; // reserve ~2 GB for OS/process
  let players = Math.min(cpuPlayers, ramPlayers, 250);
  players = Math.max(1, Math.round(players));

  // Estimated CPU load at steady state (a percentage).
  let cpuLoad = 74 - effCpu * 2.2;
  cpuLoad = Math.min(Math.max(round1(cpuLoad), 12), 98);

  // Estimated RAM usage (GB) at steady state.
  let ramUsage = 1.8 + ram * 0.62;
  ramUsage = round1(Math.min(ramUsage, ram));

  // Recommended plugin count — conservative, based on available RAM.
  const maxPlugins = Math.min(Math.floor((ram - 2) / 0.4), 40);
  const minPlugins = Math.max(3, Math.floor(maxPlugins * 0.5));

  // Build grade based on combined resource score.
  const score = cpu * 2 + ram * 0.7 + storage * 0.05;
  let grade: BuildGrade;
  if (score >= 45) grade = 'S';
  else if (score >= 28) grade = 'A';
  else if (score >= 16) grade = 'B';
  else grade = 'C';

  return {
    tps,
    concurrentPlayers: players,
    cpuLoadPercent: cpuLoad,
    ramUsageGb: ramUsage,
    plugins: { min: minPlugins, max: maxPlugins },
    grade,
  };
}

export interface PricingQuote {
  tier: TierId;
  mode: 'custom' | 'package';
  config: LowConfig | { packageId: string };
  /** Monthly price in IDR. */
  price: number;
  estimate: BuildEstimate;
  orderable: boolean;
  /** Human explanation of why it is not orderable, if any. */
  unorderableReason?: string;
}

export function lowQuote(config: LowConfig): PricingQuote {
  return {
    tier: 'low',
    mode: 'custom',
    config,
    price: lowPrice(config),
    estimate: buildEstimate({ tier: 'low', cpu: config.cpu, ram: config.ram, storage: config.storage }),
    orderable: true,
  };
}

export function highQuote(packageId: string): PricingQuote {
  const pkg = getHighPackage(packageId);
  if (!pkg) {
    throw new Error('Invalid high package id');
  }
  return {
    tier: 'high',
    mode: 'package',
    config: { packageId },
    price: pkg.price,
    estimate: buildEstimate({ tier: 'high', cpu: pkg.cpu, ram: pkg.ram, storage: pkg.storage }),
    orderable: true,
  };
}

export function mediumQuote(): PricingQuote {
  return {
    tier: 'medium',
    mode: 'package',
    config: { packageId: '' },
    price: 0,
    estimate: buildEstimate({ tier: 'medium', cpu: 4, ram: 8, storage: 40 }),
    orderable: false,
    unorderableReason: 'Ongoing — Paket belum tersedia untuk pemesanan.',
  };
}

export const LOW_LIMITS = LOW_CONFIG;
