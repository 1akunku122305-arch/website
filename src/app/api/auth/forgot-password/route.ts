import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { readJson, fail, ok, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { generateToken, hashToken, tokenExpiresAt } from '@/lib/auth/tokens';
import { emailConfigured, sendEmail } from '@/lib/email';
import { absoluteUrl } from '@/lib/seo';
import type { User } from '@/lib/types';

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
    const token = generateToken();
    await store.create('passwordResetTokens', {
      id: 'preset_' + Math.random().toString(36).slice(2),
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: tokenExpiresAt(60),
      used: false,
      createdAt: new Date().toISOString(),
    } as never);
    if (emailConfigured()) {
      await sendEmail({ to: user.email, subject: 'Reset Kata Sandi WangStore', text: `Reset: ${absoluteUrl(`/reset-password?token=${token}`)}` });
    }
  }

  return ok({ message: 'Jika email terdaftar, instruksi reset kata sandi akan dikirim.' });
}
