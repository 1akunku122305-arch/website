import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { getDatastore } from '@/lib/db';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return fail('unauthorized', 'Tidak masuk.', 401);
  const store = await getDatastore();
  const user = await store.get<User>('users', session.sub);
  if (!user) return fail('unauthorized', 'Akun tidak ditemukan.', 401);
  return ok({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
  });
}
