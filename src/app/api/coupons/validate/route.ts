import type { NextRequest } from "next/server";
import { assertSameOrigin, fail, handleError, limited, ok, parseJson } from "@/lib/api";
import { read } from "@/lib/db";
import { couponCheckSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const blocked = limited(req, "coupon", 20, 60_000);
    if (blocked) return blocked;

    const { code, subtotal } = couponCheckSchema.parse(await parseJson(req));
    const db = await read();
    const coupon = db.coupons.find((c) => c.code === code.trim().toUpperCase());

    if (!coupon || !coupon.active) return fail("Kupon tidak ditemukan.", 404);
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now())
      return fail("Kupon sudah kedaluwarsa.", 410);
    if (coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) return fail("Kuota kupon sudah habis.", 410);

    const discount =
      coupon.type === "PERCENT" ? Math.round((subtotal * coupon.value) / 100) : Math.min(subtotal, coupon.value);

    return ok({ coupon, discount });
  } catch (error) {
    return handleError(error);
  }
}
