import { readJson, ok, fail, writeAudit, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { resendVerificationEmail } from '@/lib/auth/verification';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * POST /api/auth/resend-verification
 *
 * Body (optional): `{ email }` — used when no session exists (e.g. the link
 * expired and the user is on the public verify page). When a session exists
 * the authenticated account is used instead.
 *
 * Protections:
 *  - per-user cooldown (60s) & daily cap, per-IP rate limit
 *  - invalidates previous unused tokens (single active token)
 *  - generic response when the email is unknown → no account enumeration
 */
export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'verify-email-resend' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (guard.session === null && !email) {
    return fail('validation_error', 'Email wajib diisi.', 422);
  }

  const store = await getDatastore();

  let user: User | null = null;
  if (guard.session) {
    user = await store.get<User>('users', guard.session.sub);
  }
  if (!user && email) {
    user = (await store.list<User>('users')).find((u) => u.email.toLowerCase() === email) ?? null;
  }

  // Anti-enumeration: unknown email answers the same as a successful send.
  if (!user) {
    return ok({ status: 'sent', note: 'Jika email terdaftar, tautan verifikasi akan dikirim.' });
  }

  // Already verified (authenticated path) → nothing to resend.
  if (user.emailVerified) {
    return ok({ status: 'already_verified' });
  }

  const result = await resendVerificationEmail(store, user, guard.ip ?? 'unknown');
  if (!result.ok) {
    return fail(
      result.code === 'cooldown' ? 'cooldown' : 'rate_limited',
      result.message ?? 'Terlalu banyak permintaan.',
      429,
      { retryAfterSeconds: result.retryAfterSeconds },
    );
  }

  await writeAudit({
    actorId: user.id,
    actorRole: user.role,
    action: 'update',
    resource: 'verification_tokens',
    resourceId: user.id,
    ip: guard.ip,
    metadata: { resendVerification: true },
  });

  return ok({
    status: 'sent',
    emailConfigured: result.emailConfigured,
    ...(result.devVerifyUrl ? { devVerifyUrl: result.devVerifyUrl } : {}),
  });
}
