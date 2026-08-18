import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import * as fs from 'fs';
import * as path from 'path';
import { cookies } from 'next/headers';
import type { Role } from '@/lib/types';

/**
 * JWT session management using `jose` (edge/serverless compatible).
 * Cookies are HttpOnly + SameSite=Lax (+ Secure in production).
 */

export const SESSION_COOKIE = 'wangstore_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionClaims extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

let secretCache: Uint8Array | null = null;

function loadSecret(): Uint8Array {
  if (secretCache) return secretCache;
  const env = process.env.JWT_SECRET;
  if (env && env.length >= 32) {
    secretCache = new TextEncoder().encode(env);
    return secretCache;
  }
  // Local development fallback: persistent dev secret so sessions survive restarts.
  const devFile = path.join(process.cwd(), 'data', '.dev-jwt-secret');
  try {
    if (fs.existsSync(devFile)) {
      const s = fs.readFileSync(devFile, 'utf8').trim();
      if (s.length >= 32) {
        secretCache = new TextEncoder().encode(s);
        return secretCache;
      }
    }
    const generated = 'dev_' + Array.from({ length: 48 }, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('');
    fs.mkdirSync(path.dirname(devFile), { recursive: true });
    fs.writeFileSync(devFile, generated, { mode: 0o600 });
    secretCache = new TextEncoder().encode(generated);
    return secretCache;
  } catch {
    // Last resort ephemeral secret (sessions won't survive restart in dev).
    secretCache = new TextEncoder().encode('ephemeral_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
    return secretCache;
  }
}

export async function signSession(claims: {
  userId: string;
  email: string;
  name: string;
  role: Role;
}): Promise<string> {
  return await new SignJWT({
    email: claims.email,
    name: claims.name,
    role: claims.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setIssuer('wangstore')
    .setAudience('wangstore:session')
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS)
    .sign(loadSecret());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, loadSecret(), {
      issuer: 'wangstore',
      audience: 'wangstore:session',
    });
    if (!payload.sub) return null;
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}

const isProduction = () => process.env.NODE_ENV === 'production';

/** Server-side session cookie options. */
export function sessionCookieOptions(): Record<string, unknown> {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions() as never);
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<SessionClaims | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
}
