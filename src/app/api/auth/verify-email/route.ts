import { redirect } from 'next/navigation';
import { getDatastore } from '@/lib/db';
import { hashToken, isExpired } from '@/lib/auth/tokens';
import { writeAudit } from '@/lib/api';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return redirect('/verify-email?status=invalid');
  const tokenHash = hashToken(token);

  const store = await getDatastore();
  const records = await store.list<{ id: string; userId: string; tokenHash: string; expiresAt: string; used: boolean }>('verificationTokens');
  const record = records.find((r) => r.tokenHash === tokenHash && !r.used);
  if (!record || isExpired(record.expiresAt)) {
    return redirect('/verify-email?status=invalid');
  }

  const user = await store.get<User>('users', record.userId);
  if (!user) return redirect('/verify-email?status=invalid');

  await store.update('verificationTokens', record.id as string, { used: true } as never);
  await store.update('users', user.id, { emailVerified: true } as never);
  await store.update('profiles', user.id, { emailVerified: true } as never);
  await writeAudit({ actorId: user.id, actorRole: user.role, action: 'update', resource: 'users', resourceId: user.id, metadata: { emailVerified: true } });

  return redirect('/verify-email?status=success');
}
