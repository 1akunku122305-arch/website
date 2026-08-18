import { ok, fail } from '@/lib/api';
import { resolveServerQuote } from '@/lib/pricing/server-quote';
import { serverBuilderConfigSchema } from '@/lib/validation/schemas';

export const runtime = 'nodejs';

/**
 * Shared pricing endpoint. UI and order pipeline both call the same
 * server-side quote resolver; the client can never supply a price.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = serverBuilderConfigSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());

  const result = await resolveServerQuote(parsed.data as never);
  if (!result.ok) {
    const status = result.code === 'ongoing' || result.code === 'not-orderable' ? 409 : 422;
    return fail(result.code, result.message ?? 'Tidak dapat menghitung harga.', status);
  }
  return ok({ quote: result.quote });
}
