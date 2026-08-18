import { setCsrfCookie } from '@/lib/security/csrf';
import { ok } from '@/lib/api';

export const runtime = 'nodejs';

/** Issue a CSRF token cookie (double-submit). */
export async function GET() {
  const token = await setCsrfCookie();
  return ok({ token });
}
