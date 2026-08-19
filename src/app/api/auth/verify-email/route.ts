import { redirect } from 'next/navigation';
import { readJson, ok, fail, runRequestGuard } from '@/lib/api';
import { verifyEmailToken } from '@/lib/auth/verification';

export const runtime = 'nodejs';

/**
 * Email verification.
 *
 * GET  `/api/auth/verify-email?token=...` — legacy/direct-link path: consumes
 *      the token server-side and redirects to the friendly status page
 *      (works with JavaScript disabled). Rate limited per IP.
 *
 * POST `/api/auth/verify-email` `{ token }` — used by /verify-email page;
 *      returns JSON `{ status: 'success'|'already_verified'|'expired'|'invalid' }`.
 *
 * Both paths share `verifyEmailToken()` so behaviour is identical.
 */
export async function GET(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'verify-email' });
  if (guard.error) return guard.error;

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return redirect('/verify-email?status=invalid');

  const { status } = await verifyEmailToken(token);
  return redirect(`/verify-email?status=${status}`);
}

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'verify-email' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const token = typeof body.token === 'string' && body.token ? body.token.trim() : '';
  if (!token) return fail('invalid_token', 'Token tidak valid.', 400);

  const { status } = await verifyEmailToken(token);
  return ok({ status });
}
