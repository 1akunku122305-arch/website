import { ok, fail, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { hasPermission } from '@/lib/auth/rbac';
import { resolveServiceStatus, remainingDays } from '@/lib/services';
import type { ServiceInstance, Order } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();

  let services = await store.list<ServiceInstance>('serviceInstances');
  if (hasPermission(guard.session.role, 'services:read')) {
    // staff can see all; customers only their own
  } else {
    services = services.filter((s) => s.customerId === guard.session.sub);
  }

  const orders = await store.list<Order>('orders');
  const enriched = services
    .map((s) => {
      const window = resolveServiceStatus(s);
      const order = orders.find((o) => o.id === s.orderId);
      return {
        ...s,
        status: window.status,
        remainingDays: remainingDays(s),
        order: order ? { id: order.id, status: order.status, total: order.total } : null,
      };
    })
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));

  return ok({ services: enriched });
}
