import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { z } from 'zod';
import { createServiceWindow, resolveServiceStatus, DEFAULT_SERVICE_DAYS } from '@/lib/services';
import type { Order, OrderStatus, ServiceInstance } from '@/lib/types';

export const runtime = 'nodejs';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['paid', 'cancelled', 'expired'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['completed', 'cancelled'],
  completed: ['refunded'],
  cancelled: [],
  expired: [],
  refunded: [],
};

const statusSchema = z.object({
  status: z.enum(['pending', 'awaiting_payment', 'paid', 'processing', 'completed', 'cancelled', 'expired', 'refunded']),
  activationAt: z.string().datetime().optional(),
  durationDays: z.number().int().min(1).max(730).optional(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'orders:read');
  if (denied) return denied;

  const store = await getDatastore();
  const order = await store.get<Order>('orders', params.id);
  if (!order) return fail('not_found', 'Order tidak ditemukan.', 404);
  const service = (await store.list<ServiceInstance>('serviceInstances')).find((s) => s.orderId === params.id);
  return ok({ order, service: service ?? null });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'orders:write');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());

  const store = await getDatastore();
  const order = await store.get<Order>('orders', params.id);
  if (!order) return fail('not_found', 'Order tidak ditemukan.', 404);

  const from = order.status;
  const to = parsed.data.status;
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    return fail('invalid_transition', `Tidak dapat mengubah status dari ${from} ke ${to}.`, 422);
  }

  const now = new Date().toISOString();
  await store.update('orders', params.id, { status: to, updatedAt: now } as never);

  let service: ServiceInstance | null = null;
  // On payment confirmation, create the service instance (lifecycle begins here).
  if (to === 'paid' || to === 'processing' || to === 'completed') {
    const existing = (await store.list<ServiceInstance>('serviceInstances')).find((s) => s.orderId === params.id);
    if (!existing) {
      const durationDays = parsed.data.durationDays ?? DEFAULT_SERVICE_DAYS;
      const window = createServiceWindow({ activationAt: parsed.data.activationAt, durationDays });
      const status = resolveServiceStatus({
        activationAt: window.activationAt,
        expiresAt: window.expiresAt,
        status: 'pending',
      });
      service = {
        id: 'SRV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
        customerId: order.customerId ?? '',
        orderId: params.id,
        productId: 'product_server_builder',
        packageId: order.packageId,
        serviceType: 'server_builder',
        status: status.status,
        activationAt: window.activationAt,
        expiresAt: window.expiresAt,
        renewable: true,
        price: order.total,
        createdAt: now,
        updatedAt: now,
      };
      await store.create('serviceInstances', service as never);
      await store.create('notifications', {
        id: 'notif_' + Math.random().toString(36).slice(2),
        userId: order.customerId ?? '',
        title: 'Layanan Dibuat',
        body: `Layanan ${service.id} untuk order ${params.id} telah dibuat. Status: ${status.status}.`,
        read: false,
        channel: 'dashboard',
        channelConfigured: true,
        createdAt: now,
      } as never);
    }
  }

  await writeAudit({
    actorId: guard.session.sub, actorRole: guard.session.role, action: 'order_modification', resource: 'orders', resourceId: params.id, ip: guard.ip, metadata: { from, to, serviceCreated: Boolean(service) },
  });

  return ok({ order: { id: params.id, status: to }, service });
}
