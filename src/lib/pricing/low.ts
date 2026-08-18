import { TIERS } from './tiers';

/**
 * Low tier — custom configuration.
 * CPU/RAM/Storage bounds are absolute and enforced by normalization.
 * Pricing formula is defined once here and shared by UI and API.
 */

export const LOW_CONFIG = {
  cpu: { min: 2, max: 16, step: 1 },
  ram: { min: 4, max: 32, step: 2 },
  storage: { min: 20, max: 160, step: 10 },
  // Storage 160 GB is the absolute maximum. No configuration above it.
  maxStorageGb: 160,
} as const;

export const LOW_PRICE = {
  base: 5_000,
  perCore: 7_000,
  perGbRam: 4_500,
  perGbStorage: 300,
  roundTo: 500,
  minPrice: 45_000,
} as const;

export interface LowConfig {
  cpu: number;
  ram: number;
  storage: number;
}

/** Round an integer up to the nearest multiple of `roundTo`. */
export function roundUpTo(value: number, roundTo: number): number {
  return Math.ceil(value / roundTo) * roundTo;
}

export function clampValue(value: number, min: number, max: number, step: number): number {
  if (!Number.isFinite(value)) value = min;
  let clamped = Math.min(Math.max(value, min), max);
  // Snap to nearest step within bounds.
  clamped = min + Math.round((clamped - min) / step) * step;
  clamped = Math.min(Math.max(clamped, min), max);
  return clamped;
}

/**
 * Normalize a raw low configuration into valid bounds.
 * Out-of-range values are clamped (e.g. cpu 20 → 16, ram 64 → 32, storage 900 → 160).
 */
export function normalizeLowConfig(input: Partial<LowConfig>): LowConfig {
  const cpu = clampValue(input.cpu ?? LOW_CONFIG.cpu.min, LOW_CONFIG.cpu.min, LOW_CONFIG.cpu.max, LOW_CONFIG.cpu.step);
  const ram = clampValue(input.ram ?? LOW_CONFIG.ram.min, LOW_CONFIG.ram.min, LOW_CONFIG.ram.max, LOW_CONFIG.ram.step);
  const storage = clampValue(
    input.storage ?? LOW_CONFIG.storage.min,
    LOW_CONFIG.storage.min,
    LOW_CONFIG.storage.max,
    LOW_CONFIG.storage.step,
  );
  return { cpu, ram, storage };
}

/** Validate (not clamp) — returns false if out of bounds. */
export function isValidLowConfig(input: LowConfig): boolean {
  return (
    input.cpu >= LOW_CONFIG.cpu.min &&
    input.cpu <= LOW_CONFIG.cpu.max &&
    (input.cpu - LOW_CONFIG.cpu.min) % LOW_CONFIG.cpu.step === 0 &&
    input.ram >= LOW_CONFIG.ram.min &&
    input.ram <= LOW_CONFIG.ram.max &&
    (input.ram - LOW_CONFIG.ram.min) % LOW_CONFIG.ram.step === 0 &&
    input.storage >= LOW_CONFIG.storage.min &&
    input.storage <= LOW_CONFIG.storage.max &&
    (input.storage - LOW_CONFIG.storage.min) % LOW_CONFIG.storage.step === 0
  );
}

/**
 * Compute the monthly price for a low configuration.
 * Returns IDR (rupiah). Requires a valid (already normalized) config.
 */
export function lowPrice(config: LowConfig): number {
  const raw =
    LOW_PRICE.base +
    config.cpu * LOW_PRICE.perCore +
    config.ram * LOW_PRICE.perGbRam +
    config.storage * LOW_PRICE.perGbStorage;
  const rounded = roundUpTo(raw, LOW_PRICE.roundTo);
  return Math.max(rounded, LOW_PRICE.minPrice);
}

/** Guaranteed minimum configuration → Rp45.000/bulan. */
export function lowMinimumPrice(): number {
  return lowPrice({
    cpu: LOW_CONFIG.cpu.min,
    ram: LOW_CONFIG.ram.min,
    storage: LOW_CONFIG.storage.min,
  });
}

export const LOW_TIER = TIERS.low;
