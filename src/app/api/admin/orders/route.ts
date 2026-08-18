import { ok, fail, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { Order, OrderStatus } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'orders:read');
  if (denied) return denied;

  const store = await getDatastore();
  const orders = (await store.list<Order>('orders')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok({ orders });
}
