import { ok, fail, readJson, writeAudit, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { profileSchema } from '@/lib/validation/schemas';
import type { User, Profile } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const user = await store.get<User>('users', guard.session.sub);
  const profile = (await store.list<Profile>('profiles')).find((p) => p.userId === guard.session.sub);
  if (!user) return fail('not_found', 'Akun tidak ditemukan.', 404);
  return ok({
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    whatsapp: profile?.whatsapp ?? '',
    discord: profile?.discord ?? '',
    bio: profile?.bio ?? '',
  });
}

export async function PATCH(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const body = await readJson(request);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data profil tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data;

  const store = await getDatastore();
  const now = new Date().toISOString();
  const updates: Partial<User> = {};
  if (data.name) updates.name = data.name;
  updates.updatedAt = now;

  if (Object.keys(updates).length > 0) {
    await store.update('users', guard.session.sub, updates as never);
  }

  const existing = (await store.list<Profile>('profiles')).find((p) => p.userId === guard.session.sub);
  if (existing) {
    await store.update('profiles', existing.id, {
      whatsapp: data.whatsapp,
      discord: data.discord,
      bio: data.bio,
      updatedAt: now,
    } as never);
  }

  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'update', resource: 'profiles', resourceId: guard.session.sub, ip: guard.ip });
  return ok({ message: 'Profil berhasil diperbarui.' });
}
