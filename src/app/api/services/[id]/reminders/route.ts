import { ok, fail, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { hasPermission } from '@/lib/auth/rbac';
import type { ServiceInstance } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const service = await store.get<ServiceInstance>('serviceInstances', params.id);
  if (!service) return fail('not_found', 'Layanan tidak ditemukan.', 404);
  const isOwner = service.customerId === guard.session.sub;
  const isStaff = hasPermission(guard.session.role, 'services:read');
  if (!isOwner && !isStaff) return fail('forbidden', 'Akses ditolak.', 403);

  const reminders = (await store.list<import('@/lib/types').ServiceReminder>('serviceReminders'))
    .filter((r) => r.serviceId === params.id)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  return ok({ reminders });
}
