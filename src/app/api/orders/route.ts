import { orderSchema } from '@/lib/validation/schemas';
import { readJson, fail, ok, writeAudit, runRequestGuard, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { resolveServerQuote } from '@/lib/pricing/server-quote';
import { applyCoupon } from '@/lib/coupons';
import { getSession } from '@/lib/auth/session';
import { getWhatsappNumber, buildOrderWhatsappMessage, whatsappLink } from '@/lib/whatsapp';
import { TIERS } from '@/lib/pricing/tiers';
import { getHighPackage } from '@/lib/pricing/packages';
import type { Order, OrderItem, Coupon, CouponUsage, User } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const orders = (await store.list<Order>('orders'))
    .filter((o) => o.customerId === guard.session.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok({ orders });
}

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'order' });
  if (guard.error) return guard.error;

  // A logged-in but unverified account must verify before placing orders.
  // (Anonymous/guest orders remain allowed — pre-existing behaviour.)
  const actorSession = await getSession();
  if (actorSession) {
    const store0 = await getDatastore();
    const actor = await store0.get<User>('users', actorSession.sub);
    if (actor && !actor.emailVerified) {
      return fail('email_not_verified', 'Verifikasi email Anda terlebih dahulu untuk membuat pesanan.', 403);
    }
  }

  const body = await readJson(request);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return fail('validation_error', 'Data pesanan tidak valid.', 422, parsed.error.flatten());
  }
  const data = parsed.data;

  if (!data.agreed) {
    return fail('agreement_required', 'Anda harus menyetujui kebijakan WangStore untuk membuat order.', 422);
  }

  // 1) Verify tier and compute price server-side (client price ignored entirely).
  const pricing = await resolveServerQuote(data as never);
  if (pricing.code === 'unknown-tier') {
    return fail('invalid_tier', 'Tier tidak dikenali.', 422);
  }
  if (pricing.code === 'ongoing') {
    return fail('tier_ongoing', pricing.message ?? 'Tier belum dapat dipesan.', 409);
  }
  if (pricing.code === 'not-orderable') {
    return fail('tier_not_orderable', pricing.message ?? 'Tier ini belum dapat dipesan.', 409);
  }
  if (pricing.code === 'no-package') {
    return fail('invalid_package', pricing.message ?? 'Paket tidak valid.', 422);
  }
  const quote = pricing.quote;

  const subtotal = quote.price;
  const tier = data.tier;
  const cpu = pricing.cpu;
  const ram = pricing.ram;
  const storage = pricing.storage;

  // 2) Coupon verification (server-side only).
  const store = await getDatastore();
  let discount = 0;
  let couponCode: string | undefined;
  if (data.couponCode && data.couponCode.trim()) {
    const coupons = await store.list<Coupon>('coupons');
    const coupon = coupons.find((c) => c.code.toLowerCase() === data.couponCode!.trim().toLowerCase());
    if (!coupon) {
      return fail('invalid_coupon', 'Kupon tidak ditemukan.', 422);
    }
    const usages = await store.list<CouponUsage>('couponUsages');
    const usageCount = usages.filter((u) => u.couponId === coupon.id).length;
    const customerUsageCount = data.email
      ? usages.filter((u) => u.couponId === coupon.id && u.email?.toLowerCase() === data.email.toLowerCase()).length
      : 0;
    const applied = applyCoupon({ coupon, subtotal, tier, usageCount, customerUsageCount });
    if (!applied.valid) {
      return fail('invalid_coupon', applied.reason ?? 'Kupon tidak valid.', 422);
    }
    discount = applied.discount ?? 0;
    couponCode = coupon.code;
  }

  const total = Math.max(0, subtotal - discount);
  if (total <= 0) {
    // A coupon must never produce a free order; business integrity guard.
    return fail('invalid_total', 'Total pesanan tidak valid.', 422);
  }

  // 3) Create order + item + coupon usage in a transaction.
  const session = await getSession();
  const now = new Date().toISOString();
  const orderId = 'WS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const order: Order = {
    id: orderId,
    customerId: session?.sub ?? null,
    name: data.name,
    whatsapp: data.whatsapp,
    email: data.email,
    serverName: data.serverName,
    note: data.note || undefined,
    tier,
    packageId: data.packageId,
    cpu,
    ram,
    storage,
    subtotal,
    couponCode,
    discount,
    total,
    status: 'awaiting_payment',
    currency: 'IDR',
    createdAt: now,
    updatedAt: now,
  };

  const orderItem: OrderItem = {
    id: generateId('item'),
    orderId,
    productId: 'product_server_builder',
    packageId: data.packageId,
    tier,
    cpu,
    ram,
    storage,
    price: subtotal,
  };

  await store.transaction(async (tx) => {
    await tx.create('orders', order as never);
    await tx.create('orderItems', orderItem as never);
    if (couponCode && discount > 0) {
      const coupon = (await tx.list<Coupon>('coupons')).find((c) => c.code === couponCode);
      if (coupon) {
        await tx.create('couponUsages', {
          id: generateId('cu'),
          couponId: coupon.id,
          orderId,
          email: data.email,
          discount,
          createdAt: now,
        } as never);
      }
    }
  });

  await writeAudit({
    actorId: session?.sub ?? null,
    actorRole: session?.role ?? null,
    action: 'create',
    resource: 'orders',
    resourceId: orderId,
    ip: guard.ip,
    metadata: { tier, total, couponCode },
  });

  // 4) WhatsApp link.
  const number = getWhatsappNumber();
  const message = buildOrderWhatsappMessage({
    order,
    tierLabel: TIERS[tier].label,
    packageLabel: tier === 'high' ? getHighPackage(data.packageId ?? '')?.label : undefined,
  });
  const whatsappUrl = number ? whatsappLink(number, message) : null;

  return ok(
    {
      id: orderId,
      order: {
        id: orderId,
        status: order.status,
        tier,
        cpu,
        ram,
        storage,
        subtotal,
        discount,
        total,
        couponCode,
      },
      whatsappUrl,
      whatsappConfigured: Boolean(number),
      message: whatsappUrl
        ? `Order ${orderId} dibuat. Lanjutkan pemesanan melalui WhatsApp.`
        : `Order ${orderId} dibuat. WhatsApp belum dikonfigurasi; hubungi tim WangStore melalui kanal lain.`,
    },
    201,
  );
}
