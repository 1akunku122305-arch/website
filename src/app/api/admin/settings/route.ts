import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { settingsKey } from '@/lib/settings';
import { z } from 'zod';

export const runtime = 'nodejs';

const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(80).optional(),
  tagline: z.string().max(120).optional(),
  whatsapp: z.string().max(20).optional(),
  discord: z.string().max(120).optional(),
  email: z.string().email().optional().or(z.literal('')),
  twitter: z.string().max(120).optional(),
  instagram: z.string().max(120).optional(),
  github: z.string().max(120).optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceTitle: z.string().max(120).optional(),
  maintenanceMessage: z.string().max(1000).optional(),
  maintenanceEta: z.string().max(120).optional().or(z.literal('')),
});

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'settings:write');
  if (denied) return denied;
  const store = await getDatastore();
  const settings = await store.get('siteSettings', settingsKey);
  return ok({ settings: settings ?? {} });
}

export async function PATCH(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'settings:write');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data pengaturan tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data as Record<string, unknown>;

  const store = await getDatastore();
  const now = new Date().toISOString();
  const existing = await store.get('siteSettings', settingsKey);
  if (existing) {
    await store.update('siteSettings', settingsKey, { ...data, updatedAt: now } as never);
  } else {
    await store.create('siteSettings', { id: settingsKey, ...data, createdAt: now, updatedAt: now } as never);
  }

  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'update', resource: 'siteSettings', ip: guard.ip, metadata: { fields: Object.keys(data) } });
  return ok({ message: 'Pengaturan disimpan.' });
}
