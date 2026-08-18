import { ok, fail, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import type { User, Profile, Order } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'customers:read');
  if (denied) return denied;

  const store = await getDatastore();
  const users = await store.list<User>('users');
  const profiles = await store.list<Profile>('profiles');
  const orders = await store.list<Order>('orders');

  const customers = users
    .filter((u) => u.role === 'customer')
    .map((u) => {
      const profile = profiles.find((p) => p.userId === u.id);
      const customerOrders = orders.filter((o) => o.customerId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        whatsapp: profile?.whatsapp ?? '',
        createdAt: u.createdAt,
        orderCount: customerOrders.length,
        totalSpent: customerOrders.reduce((s, o) => s + o.total, 0),
      };
    });

  return ok({ customers });
}
