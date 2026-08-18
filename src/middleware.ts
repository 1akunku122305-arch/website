import { NextRequest, NextResponse } from 'next/server';

/**
 * Maintenance mode middleware.
 *
 * Reads the maintenance flag from the (server-side) datastore via the
 * /api/health/maintenance endpoint, then shows the maintenance page for
 * public routes while allowing admin/auth/order confirmation to continue.
 *
 * Allowed paths always pass through so admins can manage settings.
 */

const ALLOWED_PREFIXES = ['/admin', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/api', '/maintenance', '/_next', '/favicon', '/robots.txt', '/sitemap.xml'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate HTML page requests.
  const isAsset = pathname.includes('.') && !pathname.startsWith('/api');
  if (isAsset) return NextResponse.next();

  try {
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/health/maintenance`, { method: 'GET', cache: 'no-store' });
    const data = (await res.json()) as { success?: boolean; data?: { maintenanceMode?: boolean } };
    const maintenance = Boolean(data?.success && data?.data?.maintenanceMode);

    if (maintenance && !ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
      const url = new URL('/maintenance', request.url);
      return NextResponse.redirect(url);
    }
  } catch {
    // If the health check fails, allow traffic (fail-open for availability).
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|robots.txt|sitemap.xml).*)'],
};
