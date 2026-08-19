import { resetPasswordSchema } from '@/lib/validation/schemas';
import { readJson, fail, ok, writeAudit, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { hashToken, isExpired } from '@/lib/auth/tokens';
import type { PasswordResetToken, User } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'password-reset' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());
  const { token, password } = parsed.data;

  const store = await getDatastore();
  const tokenHash = hashToken(token);
  const record = await store.find<PasswordResetToken>('passwordResetTokens', { tokenHash } as never);
  if (!record || record.used || isExpired(record.expiresAt)) {
    return fail('invalid_token', 'Token tidak valid atau sudah kedaluwarsa.', 400);
  }

  const user = await store.get<User>('users', record.userId);
  if (!user) return fail('invalid_token', 'Token tidak valid.', 400);

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  // Single-use: mark consumed before applying so the same link cannot reset twice.
  await store.update('passwordResetTokens', record.id, { used: true } as never);
  await store.update('users', user.id, { passwordHash, updatedAt: now } as never);
  await writeAudit({ actorId: user.id, actorRole: user.role, action: 'update', resource: 'users', resourceId: user.id, metadata: { passwordReset: true } });

  return ok({ message: 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.' });
}
