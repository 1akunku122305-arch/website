import { ok, fail, readJson, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { Notification } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const notifications = (await store.list<Notification>('notifications'))
    .filter((n) => n.userId === guard.session.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok({ notifications });
}

export async function PATCH(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const body = await readJson(request);
  const id = typeof body?.id === 'string' ? body.id : null;
  const store = await getDatastore();
  if (id) {
    const notif = await store.get<Notification>('notifications', id);
    if (notif && notif.userId === guard.session.sub) {
      await store.update('notifications', id, { read: true } as never);
    }
  } else {
    const mine = (await store.list<Notification>('notifications')).filter((n) => n.userId === guard.session.sub);
    for (const n of mine) {
      await store.update('notifications', n.id, { read: true } as never);
    }
  }
  return ok({ message: 'Notifikasi diperbarui.' });
}
