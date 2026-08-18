import { ok, fail, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { resolveServiceStatus, remainingDays } from '@/lib/services';
import type { ServiceInstance, Order, User } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'services:read');
  if (denied) return denied;

  const store = await getDatastore();
  const [services, orders, users] = await Promise.all([
    store.list<ServiceInstance>('serviceInstances'),
    store.list<Order>('orders'),
    store.list<User>('users'),
  ]);

  const enriched = services.map((s) => {
    const window = resolveServiceStatus(s);
    const order = orders.find((o) => o.id === s.orderId);
    const customer = s.customerId ? users.find((u) => u.id === s.customerId) : null;
    const renewals = 0;
    return {
      ...s,
      status: window.status,
      remainingDays: remainingDays(s),
      order: order ? { id: order.id, status: order.status, total: order.total } : null,
      customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    };
  });

  return ok({ services: enriched });
}
