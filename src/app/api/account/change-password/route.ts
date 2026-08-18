import { ok, fail, readJson, writeAudit, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { changePasswordSchema } from '@/lib/validation/schemas';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const body = await readJson(request);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());

  const store = await getDatastore();
  const user = await store.get<User>('users', guard.session.sub);
  if (!user) return fail('not_found', 'Akun tidak ditemukan.', 404);

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return fail('invalid_password', 'Kata sandi saat ini salah.', 400);

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await store.update('users', user.id, { passwordHash, updatedAt: new Date().toISOString() } as never);
  await writeAudit({ actorId: user.id, actorRole: user.role, action: 'update', resource: 'users', resourceId: user.id, ip: guard.ip, metadata: { passwordChanged: true } });

  return ok({ message: 'Kata sandi berhasil diubah.' });
}
