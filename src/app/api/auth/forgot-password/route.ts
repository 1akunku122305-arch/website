import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { readJson, fail, ok, runRequestGuard, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { PASSWORD_RESET_TTL_MINUTES, generateToken, hashToken, tokenExpiresAt } from '@/lib/auth/tokens';
import { emailConfigured, sendEmail, renderPasswordResetEmail } from '@/lib/email';
import { absoluteUrl } from '@/lib/seo';
import type { PasswordResetToken, User } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'password-reset' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Email tidak valid.', 422, parsed.error.flatten());
  const email = parsed.data.email;

  const store = await getDatastore();
  const user = (await store.list<User>('users')).find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Always respond generically to avoid leaking account existence.
  if (user) {
    // Invalidate previously unused reset tokens for this account so only the
    // latest link works (single-use, replay protection).
    const existing = await store.list<PasswordResetToken>('passwordResetTokens');
    for (const old of existing.filter((t) => t.userId === user.id && !t.used)) {
      await store.update('passwordResetTokens', old.id, { used: true } as never);
    }

    const token = generateToken();
    await store.create('passwordResetTokens', {
      id: generateId('preset'),
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: tokenExpiresAt(PASSWORD_RESET_TTL_MINUTES),
      used: false,
      createdAt: new Date().toISOString(),
    } as never);

    if (emailConfigured()) {
      const resetUrl = absoluteUrl(`/reset-password?token=${token}`);
      const { subject, html, text } = renderPasswordResetEmail({
        userName: user.name,
        resetUrl,
        ttlMinutes: PASSWORD_RESET_TTL_MINUTES,
      });
      await sendEmail({ to: user.email, subject, text, html });
      return ok({ message: 'Jika email terdaftar, instruksi reset kata sandi akan dikirim.' });
    }
    // Development fallback (email belum dikonfigurasi): kembalikan tautan reset
    // agar alur tetap bisa diuji. Hanya muncul bila provider tidak dikonfigurasi.
    return ok({
      message: 'Jika email terdaftar, instruksi reset kata sandi akan dikirim.',
      devResetUrl: absoluteUrl(`/reset-password?token=${token}`),
    });
  }

  return ok({ message: 'Jika email terdaftar, instruksi reset kata sandi akan dikirim.' });
}
