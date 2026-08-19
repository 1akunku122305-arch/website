/**
 * Rate limiting — serverless-compatible sliding window (per instance).
 *
 * NOTE: In a serverless environment each instance keeps its own counter, so
 * this is best-effort, not a hard distributed guarantee. For production
 * multi-region enforcement, add a shared limiter (e.g. Supabase/Redis-compatible).
 * This is documented in docs/SECURITY.md.
 */

export interface RateLimitConfig {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

const DEFAULT_LIMITERS: Record<string, RateLimitConfig> = {
  login: { limit: 5, windowSeconds: 300 },
  register: { limit: 5, windowSeconds: 3600 },
  'password-reset': { limit: 3, windowSeconds: 600 },
  /** Verification token attempts (per IP) — brute-force protection. */
  'verify-email': { limit: 20, windowSeconds: 300 },
  /** Resend verification email (per IP). */
  'verify-email-resend': { limit: 5, windowSeconds: 3600 },
  /** Resend verification email (per user, daily cap — enforced in lib/auth/verification.ts). */
  'verify-email-resend-user': { limit: 10, windowSeconds: 86400 },
  order: { limit: 20, windowSeconds: 300 },
  contact: { limit: 5, windowSeconds: 300 },
  renew: { limit: 10, windowSeconds: 300 },
  default: { limit: 60, windowSeconds: 60 },
};

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function keyFor(scope: string, identifier: string): string {
  return `${scope}:${identifier}`;
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() ?? 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 */
export function rateLimit(
  scope: string,
  identifier: string,
  override?: RateLimitConfig,
): { allowed: boolean; retryAfterSeconds?: number } {
  const cfg = override ?? DEFAULT_LIMITERS[scope] ?? DEFAULT_LIMITERS['default']!;
  const now = Date.now();
  const key = keyFor(scope, identifier);
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + cfg.windowSeconds * 1000 };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > cfg.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  // Light cleanup to avoid unbounded growth.
  if (buckets.size > 10_000) {
    const cutoff = now;
    for (const [k, b] of buckets) {
      if (b.resetAt <= cutoff) buckets.delete(k);
    }
  }

  return { allowed: true };
}

export function rateLimitScopeForPathname(pathname: string): string {
  if (pathname.includes('/api/auth/login')) return 'login';
  if (pathname.includes('/api/auth/register')) return 'register';
  if (pathname.includes('/api/auth/forgot')) return 'password-reset';
  if (pathname.includes('/api/auth/verify-email')) return 'verify-email';
  if (pathname.includes('/api/auth/resend-verification')) return 'verify-email-resend';
  if (pathname.includes('/api/orders')) return 'order';
  if (pathname.includes('/renew')) return 'renew';
  if (pathname.includes('/api/contact')) return 'contact';
  return 'default';
}
