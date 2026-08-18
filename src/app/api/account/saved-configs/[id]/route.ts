import { ok, fail, writeAudit, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { SavedConfiguration } from '@/lib/types';

export const runtime = 'nodejs';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const config = await store.get<SavedConfiguration>('savedConfigurations', params.id);
  if (!config || config.userId !== guard.session.sub) {
    return fail('not_found', 'Konfigurasi tidak ditemukan.', 404);
  }
  await store.delete('savedConfigurations', params.id);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'delete', resource: 'savedConfigurations', resourceId: params.id, ip: guard.ip });
  return ok({ deleted: true });
}
