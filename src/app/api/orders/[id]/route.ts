import { ok, fail } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { getWhatsappNumber, buildOrderWhatsappMessage, whatsappLink } from '@/lib/whatsapp';
import { TIERS } from '@/lib/pricing/tiers';
import { getHighPackage } from '@/lib/pricing/packages';
import type { Order } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const store = await getDatastore();
  const order = await store.get<Order>('orders', params.id);
  if (!order) return fail('not_found', 'Order tidak ditemukan.', 404);

  const session = await getSession();
  // Visible to the owning customer or any staff role.
  const isOwner = session?.sub === order.customerId;
  const isStaff = session && hasPermission(session.role, 'orders:read');
  if (!isOwner && !isStaff) {
    return fail('forbidden', 'Anda tidak memiliki akses ke order ini.', 403);
  }

  const number = getWhatsappNumber();
  const message = buildOrderWhatsappMessage({
    order,
    tierLabel: TIERS[order.tier].label,
    packageLabel: order.packageId ? getHighPackage(order.packageId)?.label : undefined,
  });

  return ok({
    order: {
      ...order,
      whatsappUrl: number ? whatsappLink(number, message) : null,
      whatsappConfigured: Boolean(number),
      message,
    },
  });
}
