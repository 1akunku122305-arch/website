import { loginSchema } from '@/lib/validation/schemas';
import { readJson, fail, ok, writeAudit, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { verifyPassword, dummyCompare } from '@/lib/auth/password';
import { signSession, setSessionCookie } from '@/lib/auth/session';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'login' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail('validation_error', 'Data login tidak valid.', 422, parsed.error.flatten());
  }
  const { email, password } = parsed.data;

  const store = await getDatastore();
  const user = (await store.list<User>('users')).find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Timing-resistant: always perform a comparison.
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!valid) {
    if (!user) await dummyCompare();
    await writeAudit({ actorId: user?.id ?? null, actorRole: user?.role ?? null, action: 'failed_login', resource: 'auth', ip: guard.ip });
    return fail('invalid_credentials', 'Email atau kata sandi salah.', 401);
  }

  if (!user) {
    return fail('invalid_credentials', 'Email atau kata sandi salah.', 401);
  }

  const session = await signSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(session);
  await writeAudit({ actorId: user.id, actorRole: user.role, action: 'login', resource: 'auth', ip: guard.ip });

  return ok({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
  });
}
