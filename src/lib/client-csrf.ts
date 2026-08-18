'use client';

import { CSRF_COOKIE } from './security/csrf-constants';

/**
 * Client-side CSRF token helper (double-submit).
 * Reads the CSRF cookie; if absent, requests a fresh one via the API.
 */

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m?.[1] ? decodeURIComponent(m[1]) : undefined;
}

export function getCsrfClientToken(): string | undefined {
  return readCookie(CSRF_COOKIE);
}

export async function getOrCreateCsrfToken(): Promise<string> {
  const existing = getCsrfClientToken();
  if (existing) return existing;
  try {
    const res = await fetch('/api/csrf');
    const data = (await res.json()) as { token?: string };
    return data.token ?? '';
  } catch {
    return '';
  }
}
