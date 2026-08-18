import { ok, writeAudit } from '@/lib/api';
import { clearSessionCookie, getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST() {
  const session = await getSession();
  await writeAudit({ actorId: session?.sub ?? null, actorRole: session?.role ?? null, action: 'logout', resource: 'auth' });
  await clearSessionCookie();
  return ok({ loggedOut: true });
}
