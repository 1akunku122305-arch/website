import { cookies } from 'next/headers';
import { CSRF_COOKIE } from './csrf-constants';

/**
 * CSRF protection — double-submit cookie + Origin validation.
 *
 * A random token is issued as a readable cookie; every state-changing request
 * must echo it back in the `x-csrf-token` header. Cross-origin attackers
 * cannot set custom headers (CORS preflight) nor read the cookie value.
 */

const SENSITIVE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function randomToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getCsrfCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CSRF_COOKIE)?.value;
}

export async function setCsrfCookie(): Promise<string> {
  const store = await cookies();
  const token = randomToken();
  store.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return token;
}

export async function getOrCreateCsrfToken(): Promise<string> {
  const existing = await getCsrfCookie();
  if (existing) return existing;
  return setCsrfCookie();
}

/**
 * Validate that a request is same-origin and carries a valid CSRF token
 * for state-changing methods. Returns an error message string or null.
 */
export async function validateCsrf(request: Request): Promise<string | null> {
  const method = request.method.toUpperCase();

  // Origin validation (only enforced when the browser sends Origin).
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && !origin.startsWith(appUrl.replace(/\/$/, ''))) {
      return 'Origin tidak diizinkan.';
    }
    if (!appUrl && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return 'Origin tidak diizinkan.';
        }
      } catch {
        return 'Origin tidak valid.';
      }
    }
  }

  if (!SENSITIVE_METHODS.has(method)) return null;

  const cookieToken = await getCsrfCookie();
  const headerToken = request.headers.get('x-csrf-token');
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return 'Permintaan tidak memiliki token CSRF yang valid.';
  }
  return null;
}
