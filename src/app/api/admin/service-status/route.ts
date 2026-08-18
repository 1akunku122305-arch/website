import { ok, fail, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { resolveServiceStatus } from '@/lib/services';
import type { ServiceInstance } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'services:read');
  if (denied) return denied;

  const store = await getDatastore();
  const services = await store.list<ServiceInstance>('serviceInstances');
  const counts: Record<string, number> = {};
  for (const s of services) {
    const status = resolveServiceStatus(s).status;
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return ok({ counts });
}
