import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { isOwner, canManageRole, ROLE_HIERARCHY } from '@/lib/auth/rbac';
import { z } from 'zod';
import type { User, Role } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'users:read');
  if (denied) return denied;
  const store = await getDatastore();
  const users = (await store.list<User>('users')).map((u) => ({
    id: u.id, name: u.name, email: u.email, role: u.role, emailVerified: u.emailVerified, createdAt: u.createdAt,
  }));
  return ok({ users });
}

const roleSchema = z.object({ userId: z.string().min(1), role: z.enum(['owner', 'admin', 'staff', 'customer']) });

export async function PATCH(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'roles:manage');
  if (denied) return denied;
  // Only owner may manage roles.
  if (!isOwner(guard.session.role)) return fail('forbidden', 'Hanya Owner yang dapat mengelola role.', 403);

  const body = await readJson(request);
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data role tidak valid.', 422, parsed.error.flatten());
  const { userId, role } = parsed.data;

  const store = await getDatastore();
  const user = await store.get<User>('users', userId);
  if (!user) return fail('not_found', 'Pengguna tidak ditemukan.', 404);
  if (!canManageRole(guard.session.role, role)) {
    return fail('forbidden', 'Role tersebut tidak dapat dikelola.', 403);
  }

  await store.update('users', userId, { role: role as Role, updatedAt: new Date().toISOString() } as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'role_change', resource: 'users', resourceId: userId, ip: guard.ip, metadata: { from: user.role, to: role, hierarchy: ROLE_HIERARCHY[role] } });
  return ok({ user: { id: userId, role } });
}
