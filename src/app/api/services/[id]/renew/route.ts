import { ok, fail, readJson, writeAudit, runRequestGuard, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { renewalSchema } from '@/lib/validation/schemas';
import { hasPermission } from '@/lib/auth/rbac';
import { getSession } from '@/lib/auth/session';
import { canRenew, resolveServiceStatus, computeRenewalWindow } from '@/lib/services';
import { getWhatsappNumber, buildOrderWhatsappMessage, whatsappLink } from '@/lib/whatsapp';
import { TIERS } from '@/lib/pricing/tiers';
import type { ServiceInstance, Order, VpsPackage } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true, rateLimitScope: 'renew' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const parsed = renewalSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Durasi perpanjangan tidak valid.', 422, parsed.error.flatten());
  const durationDays = parsed.data.durationDays;

  const store = await getDatastore();
  const service = await store.get<ServiceInstance>('serviceInstances', params.id);
  if (!service) return fail('not_found', 'Layanan tidak ditemukan.', 404);

  const isOwner = service.customerId === guard.session.sub;
  const isStaff = hasPermission(guard.session.role, 'services:write');
  if (!isOwner && !isStaff) return fail('forbidden', 'Akses ditolak.', 403);

  // Business validation.
  if (!canRenew(service)) {
    return fail('not_renewable', 'Layanan ini tidak dapat diperpanjang.', 409);
  }
  const resolved = resolveServiceStatus(service);
  if (resolved.status === 'terminated' || resolved.status === 'cancelled') {
    return fail('not_renewable', 'Layanan tidak dapat diperpanjang.', 409);
  }

  // Price computed server-side.
  let price = service.price;
  let packageValid = true;
  if (service.serviceType === 'vps_package' && service.packageId) {
    const vps = await store.get<VpsPackage>('vpsPackages', service.packageId);
    if (!vps || vps.status === 'inactive') {
      packageValid = false;
    } else {
      price = vps.price;
    }
  }
  if (!packageValid) return fail('package_invalid', 'Paket tidak lagi tersedia untuk perpanjangan.', 422);

  const session = await getSession();
  const now = new Date().toISOString();
  const window = computeRenewalWindow(service, durationDays);
  const orderId = 'WS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

  const order: Order = {
    id: orderId,
    customerId: service.customerId,
    name: session?.name ?? '',
    whatsapp: '',
    email: session?.email ?? '',
    serverName: 'Perpanjangan ' + service.id,
    tier: 'low',
    cpu: 2,
    ram: 4,
    storage: 20,
    subtotal: price,
    discount: 0,
    total: price,
    status: 'awaiting_payment',
    currency: 'IDR',
    note: `Perpanjangan layanan ${service.id} selama ${durationDays} hari.`,
    createdAt: now,
    updatedAt: now,
  };

  await store.transaction(async (tx) => {
    await tx.create('orders', order as never);
    await tx.create('serviceRenewals', {
      id: generateId('renewal'),
      serviceId: service.id,
      orderId,
      duration: durationDays,
      oldExpiresAt: window.oldExpiresAt,
      newExpiresAt: window.expiresAt,
      price,
      status: 'pending',
      createdAt: now,
    } as never);
  });

  await writeAudit({
    actorId: session?.sub ?? null,
    actorRole: session?.role ?? null,
    action: 'renewal',
    resource: 'serviceInstances',
    resourceId: service.id,
    ip: guard.ip,
    metadata: { orderId, durationDays, oldExpiresAt: window.oldExpiresAt, newExpiresAt: window.expiresAt, price },
  });

  const number = getWhatsappNumber();
  const message = buildOrderWhatsappMessage({ order, tierLabel: 'Perpanjangan' });
  const whatsappUrl = number ? whatsappLink(number, message) : null;

  return ok({
    orderId,
    renewal: { newExpiresAt: window.expiresAt },
    whatsappUrl,
    whatsappConfigured: Boolean(number),
    message:
      'Order perpanjangan dibuat. Masa layanan akan diperpanjang setelah pembayaran/konfirmasi diverifikasi.',
  }, 201);
}
