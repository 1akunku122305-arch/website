import { createHash, randomBytes } from 'crypto';

/**
 * Opaque single-use tokens for email verification and password reset.
 * Only the SHA-256 hash of a token is stored; lookups compare hashes.
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
  return expiresAt <= new Date().toISOString();
}
