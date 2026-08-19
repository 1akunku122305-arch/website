/**
 * Email verification engine — shared by the API routes and the tests.
 *
 * Responsibilities:
 *  - create single-use, hashed, time-limited verification tokens
 *  - invalidate previous unused tokens when a new one is issued (resend)
 *  - consume a token exactly once (race-safe on stores with transactions)
 *  - enforce resend rate limits (per-user cooldown, per-IP, daily cap)
 *  - send the branded verification email (no token exposed in plaintext
 *    storage; the raw token only ever travels via the email link)
 */

import { getDatastore } from '@/lib/db';
import type { DataStore } from '@/lib/db/types';
import {
  EMAIL_VERIFY_TTL_MINUTES,
  generateToken,
  hashToken,
  isExpired,
  tokenExpiresAt,
} from '@/lib/auth/tokens';
import { emailConfigured, sendEmail, renderVerificationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/security/rate-limit';
import { writeAudit } from '@/lib/api';
import { generateId } from '@/lib/utils';
import { absoluteUrl } from '@/lib/seo';
import type { Profile, User, VerificationToken } from '@/lib/types';

/** Cooldown between verification emails (seconds). */
export const RESEND_COOLDOWN_SECONDS = 60;

/** Maximum verification emails a single user may request per day. */
export const RESEND_DAILY_CAP = 10;

export type VerifyEmailStatus = 'success' | 'expired' | 'invalid' | 'already_verified';

export interface ResendResult {
  ok: boolean;
  code?: string;
  message?: string;
  retryAfterSeconds?: number;
  emailConfigured?: boolean;
  delivered?: boolean;
  devVerifyUrl?: string;
}

/**
 * Create a fresh verification token for a user, invalidating all of their
 * previously unused tokens first (single active token per account).
 */
export async function createVerificationToken(
  store: DataStore,
  user: { id: string },
): Promise<{ token: string; record: VerificationToken }> {
  const now = new Date().toISOString();
  const records = await store.list<VerificationToken>('verificationTokens');
  const active = records.filter((r) => r.userId === user.id && !r.used);
  for (const old of active) {
    await store.update('verificationTokens', old.id, { used: true } as never);
  }
  const token = generateToken();
  const record: VerificationToken = {
    id: generateId('vtok'),
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: tokenExpiresAt(EMAIL_VERIFY_TTL_MINUTES),
    used: false,
    createdAt: now,
  };
  await store.create('verificationTokens', record as never);
  return { token, record };
}

/** Build and send the branded verification email. */
export async function sendVerificationEmail(
  user: { name: string; email: string },
  token: string,
): Promise<{ devVerifyUrl: string; delivered: boolean; reason?: string }> {
  const devVerifyUrl = absoluteUrl(`/verify-email?token=${token}`);
  if (!emailConfigured()) {
    return { devVerifyUrl, delivered: false, reason: 'Layanan email belum dikonfigurasi.' };
  }
  const { subject, html, text } = renderVerificationEmail({
    userName: user.name,
    verifyUrl: devVerifyUrl,
    ttlMinutes: EMAIL_VERIFY_TTL_MINUTES,
  });
  const result = await sendEmail({ to: user.email, subject, text, html });
  return { devVerifyUrl, delivered: result.delivered, reason: result.reason };
}

/**
 * Issue a new verification email with rate limiting:
 *  - per-user cooldown (default 60s) derived from the latest unused token
 *  - per-IP limit (5/hour)
 *  - per-user daily cap (10/day)
 */
export async function resendVerificationEmail(
  store: DataStore,
  user: { id: string; name: string; email: string },
  ip: string,
): Promise<ResendResult> {
  const records = await store.list<VerificationToken>('verificationTokens');
  const latest = records
    .filter((r) => r.userId === user.id && !r.used)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (latest) {
    const elapsedSeconds = (Date.now() - new Date(latest.createdAt).getTime()) / 1000;
    const retry = RESEND_COOLDOWN_SECONDS - Math.floor(elapsedSeconds);
    if (retry > 0) {
      return {
        ok: false,
        code: 'cooldown',
        message: `Email verifikasi sudah dikirim baru-baru ini. Kirim ulang dalam ${retry} detik.`,
        retryAfterSeconds: retry,
      };
    }
  }

  const ipLimit = rateLimit('verify-email-resend', ip);
  if (!ipLimit.allowed) {
    return {
      ok: false,
      code: 'rate_limited',
      message: 'Terlalu banyak permintaan kirim ulang. Silakan coba lagi nanti.',
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    };
  }

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const sentToday = records.filter(
    (r) => r.userId === user.id && new Date(r.createdAt).getTime() >= dayStart.getTime(),
  ).length;
  if (sentToday >= RESEND_DAILY_CAP) {
    return {
      ok: false,
      code: 'rate_limited',
      message: 'Batas harian pengiriman email verifikasi tercapai. Silakan coba lagi besok.',
    };
  }

  const { token } = await createVerificationToken(store, user);
  const { devVerifyUrl, delivered } = await sendVerificationEmail(user, token);
  return {
    ok: true,
    emailConfigured: emailConfigured(),
    delivered,
    ...(!emailConfigured() ? { devVerifyUrl } : {}),
  };
}

export interface VerifyEmailOptions {
  /** Inject a store (tests). Defaults to the active datastore. */
  store?: DataStore;
  /** Skip audit logging (tests / callers that manage their own audit). */
  skipAudit?: boolean;
}

/**
 * Validate and consume a verification token.
 *
 * Guarantees:
 *  - token must exist, be unused, and not be expired
 *  - on success the token is marked used (single-use) and the user's
 *    `emailVerified`/`emailVerifiedAt` are updated atomically
 *  - a token presented for an already-verified account is consumed and
 *    reported as `already_verified` (no state change)
 *  - used/unknown tokens are reported as `invalid` (never re-verifiable)
 */
export async function verifyEmailToken(
  token: string,
  opts: VerifyEmailOptions = {},
): Promise<{ status: VerifyEmailStatus; email?: string }> {
  const store = opts.store ?? (await getDatastore());
  const tokenHash = hashToken(token);

  const record = await store.find<VerificationToken>('verificationTokens', { tokenHash } as never);
  if (!record || record.used) return { status: 'invalid' };
  if (isExpired(record.expiresAt)) return { status: 'expired' };

  const user = await store.get<User>('users', record.userId);
  if (!user) return { status: 'invalid' };

  const now = new Date().toISOString();

  // Already verified → consume the token so it cannot be replayed, no change.
  if (user.emailVerified) {
    await store.update('verificationTokens', record.id, { used: true } as never);
    return { status: 'already_verified', email: user.email };
  }

  // Consume token + update user atomically where the backend supports it
  // (JSON store serializes transactions; Supabase REST is passthrough, so a
  // double-click within milliseconds can only re-verify — never bypass).
  let consumed = false;
  try {
    consumed = await store.transaction(async (tx) => {
      const current = await tx.find<VerificationToken>('verificationTokens', { tokenHash } as never);
      if (!current || current.used) return false;
      await tx.update('verificationTokens', current.id, { used: true } as never);
      await tx.update('users', user.id, {
        emailVerified: true,
        emailVerifiedAt: now,
        updatedAt: now,
      } as never);
      const profile = (await tx.list<Profile>('profiles')).find((p) => p.userId === user.id);
      if (profile) {
        await tx.update('profiles', profile.id, {
          emailVerified: true,
          emailVerifiedAt: now,
          updatedAt: now,
        } as never);
      }
      return true;
    });
  } catch (err) {
    console.error('[verification] gagal mengonsumsi token:', err);
    return { status: 'invalid' };
  }
  if (!consumed) return { status: 'invalid' };

  if (!opts.skipAudit) {
    await writeAudit({
      actorId: user.id,
      actorRole: user.role,
      action: 'update',
      resource: 'users',
      resourceId: user.id,
      metadata: { emailVerified: true, emailVerifiedAt: now },
    });
  }

  return { status: 'success', email: user.email };
}
