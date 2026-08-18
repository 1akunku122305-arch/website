import { ok, fail, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { AuditLog } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'audit:read');
  if (denied) return denied;

  const store = await getDatastore();
  const logs = (await store.list<AuditLog>('auditLogs')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok({ logs });
}
