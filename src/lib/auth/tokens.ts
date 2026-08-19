import { createHash, randomBytes } from 'crypto';

/**
 * Opaque single-use tokens for email verification and password reset.
 * Only the SHA-256 hash of a token is stored; lookups compare hashes.
 * Tokens are 256-bit cryptographically-random values — never sequential
 * and infeasible to guess/brute-force.
 */

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function tokenExpiresAt(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

/** Clamp an env-provided TTL (minutes) into a sane production range. */
function clampTtl(raw: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Email verification token TTL in minutes (default 60, range 5–1440). */
export const EMAIL_VERIFY_TTL_MINUTES = clampTtl(process.env.EMAIL_VERIFY_TTL_MINUTES, 60, 5, 1440);

/** Password reset token TTL in minutes (default 60, range 5–1440). */
export const PASSWORD_RESET_TTL_MINUTES = clampTtl(process.env.PASSWORD_RESET_TTL_MINUTES, 60, 5, 1440);
