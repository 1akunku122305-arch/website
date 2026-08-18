import { ok, fail, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { Order, OrderItem, Coupon, CouponUsage, User } from '@/lib/types';

export const runtime = 'nodejs';

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function startOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'analytics:read');
  if (denied) return denied;

  const store = await getDatastore();
  const [orders, items, coupons, usages, customers] = await Promise.all([
    store.list<Order>('orders'),
    store.list<OrderItem>('orderItems'),
    store.list<Coupon>('coupons'),
    store.list<CouponUsage>('couponUsages'),
    store.list<User>('users'),
  ]);

  const confirmed = orders.filter((o) => ['paid', 'processing', 'completed'].includes(o.status));
  const todayStart = startOfToday();
  const monthStart = startOfMonth();

  // Package popularity from order items.
  const popularity = new Map<string, number>();
  for (const it of items) {
    const key = it.tier + (it.packageId ? ':' + it.packageId : `:${it.cpu}c${it.ram}g`);
    popularity.set(key, (popularity.get(key) ?? 0) + 1);
  }
  const popularPackages = Array.from(popularity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, count]) => ({ key: k, count }));

  return ok({
    totalOrders: orders.length,
    ordersToday: orders.filter((o) => o.createdAt >= todayStart).length,
    ordersThisMonth: orders.filter((o) => o.createdAt >= monthStart).length,
    revenue: confirmed.reduce((s, o) => s + o.total, 0),
    revenueThisMonth: confirmed.filter((o) => o.createdAt >= monthStart).reduce((s, o) => s + o.total, 0),
    customers: customers.filter((u) => u.role === 'customer').length,
    popularPackages,
    couponUsage: usages.length,
    couponCount: coupons.filter((c) => !c.deleted).length,
  });
}
