import { NextResponse } from 'next/server';
import type { Role, User } from '@/lib/types';
import { getSession, type SessionClaims } from '@/lib/auth/session';
import { hasPermission, type Permission } from '@/lib/auth/rbac';
import { validateCsrf } from '@/lib/security/csrf';
import { sanitizeValue } from '@/lib/security/sanitize';
import { rateLimit, getClientIp, rateLimitScopeForPathname } from '@/lib/security/rate-limit';
import { getDatastore } from '@/lib/db';
import type { AuditAction } from '@/lib/types';
import { generateId } from '@/lib/utils';

/** Consistent JSON response envelope. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status = 400, errors?: unknown): NextResponse {
  return NextResponse.json({ success: false, code, message, ...(errors ? { errors } : {}) }, { status });
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== 'object') return {};
  return sanitizeValue(raw) as Record<string, unknown>;
}

export interface RouteContext {
  session: SessionClaims | null;
}

/** Enforce authentication. Returns {session} or a NextResponse to short-circuit. */
export async function requireAuth(request: Request): Promise<{ session: SessionClaims; response?: never } | { session: null; response: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { session: null, response: fail('unauthorized', 'Anda harus masuk untuk melanjutkan.', 401) };
  }
  return { session };
}

/** Enforce a permission for the authenticated actor. */
export function requirePermissionResponse(role: Role | null, permission: Permission): NextResponse | null {
  if (!role || !hasPermission(role, permission)) {
    return fail('forbidden', 'Anda tidak memiliki izin untuk melakukan tindakan ini.', 403);
  }
  return null;
}

/** Run the common pipeline: payload limit, auth, verification, CSRF, rate limit. */
export async function runRequestGuard(
  request: Request,
  opts: {
    authRequired: true;
    /** Enforce `emailVerified` (default true when authRequired). Set false to allow unverified sessions. */
    verified?: boolean;
    csrf?: boolean;
    rateLimitScope?: string;
  },
): Promise<{ session: SessionClaims; error?: NextResponse; ip?: string }>;
export async function runRequestGuard(
  request: Request,
  opts?: {
    authRequired?: boolean;
    verified?: boolean;
    csrf?: boolean;
    rateLimitScope?: string;
  },
): Promise<{ session: SessionClaims | null; error?: NextResponse; ip?: string }>;
export async function runRequestGuard(
  request: Request,
  opts: {
    authRequired?: boolean;
    verified?: boolean;
    csrf?: boolean;
    rateLimitScope?: string;
  } = {},
): Promise<{ session: SessionClaims | null; error?: NextResponse; ip?: string }> {
  const ip = getClientIp(request);

  // Rate limit (best-effort, per instance).
  const scope = opts.rateLimitScope ?? rateLimitScopeForPathname(new URL(request.url).pathname);
  const rl = rateLimit(scope, ip);
  if (!rl.allowed) {
    return { session: null, error: fail('rate_limited', 'Terlalu banyak permintaan. Silakan coba lagi nanti.', 429) };
  }

  // CSRF / origin validation.
  if (opts.csrf !== false) {
    const csrfErr = await validateCsrf(request);
    if (csrfErr) {
      return { session: null, error: fail('csrf_denied', csrfErr, 403) };
    }
  }

  // Authentication (+ email verification gate for protected routes).
  let session: SessionClaims | null = null;
  if (opts.authRequired) {
    const auth = await getSession();
    if (!auth) {
      return { session: null, error: fail('unauthorized', 'Anda harus masuk untuk melanjutkan.', 401) };
    }
    session = auth;
    if (opts.verified !== false) {
      const store = await getDatastore();
      const user = await store.get<User>('users', auth.sub);
      if (!user) {
        return { session: null, error: fail('unauthorized', 'Akun tidak ditemukan.', 401) };
      }
      if (!user.emailVerified) {
        return {
          session: null,
          error: fail('email_not_verified', 'Verifikasi email Anda terlebih dahulu untuk mengakses fitur ini.', 403, {
            verifyUrl: '/verify-email?status=unverified',
          }),
        };
      }
    }
  } else {
    session = await getSession();
  }

  return { session, ip };
}

/** Write an audit log entry. */
export async function writeAudit(input: {
  actorId: string | null;
  actorRole?: Role | null;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const store = await getDatastore();
    await store.create('auditLogs', {
      id: generateId('audit'),
      actorId: input.actorId,
      actorRole: input.actorRole ?? null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      ip: input.ip,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
    } as never);
  } catch {
    // Audit logging must not break the primary operation.
  }
}

export { generateId };
