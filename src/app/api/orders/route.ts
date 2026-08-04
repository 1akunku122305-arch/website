import type { NextRequest } from "next/server";
import { assertSameOrigin, fail, handleError, limited, ok, parseJson } from "@/lib/api";
import { id, read, write } from "@/lib/db";
import { computeQuote, formatIDR, normalizeConfig, CYCLES, SOFTWARES } from "@/lib/pricing";
import { orderSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildWhatsAppMessage(order: Order, monthly: number, cycleLabel: string): string {
  const c = order.config;
  const software = SOFTWARES.find((s) => s.id === c.software)?.label ?? String(c.software);
  const panel = "Pterodactyl"; // Panel removed from builder

  return [
    "*PESANAN WANGSTORE*",
    `ID Pesanan  : ${order.id}`,
    "",
    `Nama        : ${order.customer.name}`,
    `Email       : ${order.customer.email}`,
    `WhatsApp    : ${order.customer.whatsapp}`,
    `Nama Server : ${order.serverName}`,
    "",
    "*SPESIFIKASI*",
    `CPU         : ${c.cpu} vCore`,
    `RAM         : ${c.ram} GB`,
      `SSD         : ${c.ssd} GB`,
    `OS          : ${c.os}`,
    `Software    : ${software}`,
    `Minecraft   : ${c.mcVersion}`,
    `Java        : ${c.java}`,
    "",
    "*ADD-ON*",

    "",
    "*BIAYA*",
    `Siklus      : ${cycleLabel}`,
    `Per bulan   : ${formatIDR(monthly)}`,
    `Subtotal    : ${formatIDR(order.subtotal)}`,
    order.coupon ? `Kupon ${order.coupon} : -${formatIDR(order.discount)}` : "",
    `TOTAL       : ${formatIDR(order.total)}`,
    "",
    order.notes ? `Catatan: ${order.notes}` : "",
    "",
    "Mohon konfirmasi metode pembayaran. Terima kasih!",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const blocked = limited(req, "orders", 8, 60_000);
    if (blocked) return blocked;

    const body = orderSchema.parse(await parseJson(req));
    const db = await read();

    if (db.settings.maintenance) {
      return fail("Pemesanan sementara ditutup karena pemeliharaan.", 503);
    }

    const config = normalizeConfig(body.config as never);
    const coupon = body.coupon ? db.coupons.find((c) => c.code === body.coupon) ?? null : null;
    const quote = computeQuote(config, db.priceFormula, coupon);

    const order: Order = {
      id: id("ord"),
      createdAt: new Date().toISOString(),
      status: "NEW",
      customer: { name: body.name, whatsapp: body.whatsapp, email: body.email },
      serverName: body.serverName,
      notes: body.notes,
      coupon: quote.couponApplied,
      config: config as unknown as Record<string, string | number | boolean>,
      subtotal: quote.subtotal,
      discount: quote.couponDiscount,
      total: quote.total,
    };

    await write((d) => {
      d.orders.unshift(order);
      if (quote.couponApplied) {
        const c = d.coupons.find((x) => x.code === quote.couponApplied);
        if (c) c.uses += 1;
      }
      d.audit.unshift({
        id: id("log"),
        at: order.createdAt,
        actor: body.email,
        action: "ORDER_CREATED",
        target: order.id,
      });
    });

    const message = buildWhatsAppMessage(order, quote.monthly, CYCLES[config.billingCycle].label);
    const whatsappUrl = `https://wa.me/${db.settings.social.whatsapp}?text=${encodeURIComponent(message)}`;

    return ok({ orderId: order.id, total: order.total, whatsappUrl, couponError: quote.couponError });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const db = await read();
    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();

    if (session) return ok({ orders: db.orders });
    if (!email) return fail("Parameter email wajib diisi.", 400);

    const blocked = limited(req, "orders-lookup", 20, 60_000);
    if (blocked) return blocked;

    return ok({ orders: db.orders.filter((o) => o.customer.email.toLowerCase() === email) });
  } catch (error) {
    return handleError(error);
  }
}
