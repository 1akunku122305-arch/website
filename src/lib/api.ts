import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";
import { clientIp, rateLimit } from "./rate-limit";
import { firstError } from "./validation";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) return fail(firstError(error), 422);
  if (error instanceof AuthError) return fail(error.message, 403);
  console.error("[wangstore:api]", error);
  return fail("Terjadi kesalahan pada server.", 500);
}

/** Rejects cross-site state-changing requests (double-submit + origin check). */
export function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new AuthError("Permintaan lintas situs ditolak.");
  } catch {
    throw new AuthError("Permintaan lintas situs ditolak.");
  }
}

export function limited(req: NextRequest, name: string, limit: number, windowMs: number) {
  const result = rateLimit(`${name}:${clientIp(req)}`, limit, windowMs);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
    );
  }
  return null;
}

export async function parseJson(req: NextRequest): Promise<unknown> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new AuthError("Content-Type harus application/json.");
  const text = await req.text();
  if (text.length > 100_000) throw new AuthError("Payload terlalu besar.");
  return JSON.parse(text || "{}");
}
