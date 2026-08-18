import { ok, fail, readJson, writeAudit, runRequestGuard, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { savedConfigSchema } from '@/lib/validation/schemas';
import { normalizeLowConfig } from '@/lib/pricing';
import type { SavedConfiguration } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const configs = (await store.list<SavedConfiguration>('savedConfigurations'))
    .filter((c) => c.userId === guard.session.sub)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return ok({ configs });
}

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const body = await readJson(request);
  const parsed = savedConfigSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data konfigurasi tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data;

  let cpu = data.cpu ?? 0;
  let ram = data.ram ?? 0;
  let storage = data.storage ?? 0;
  if (data.tier === 'low') {
    const n = normalizeLowConfig({ cpu: data.cpu, ram: data.ram, storage: data.storage });
    cpu = n.cpu;
    ram = n.ram;
    storage = n.storage;
  }

  const store = await getDatastore();
  const now = new Date().toISOString();
  const config: SavedConfiguration = {
    id: generateId('cfg'),
    userId: guard.session.sub,
    tier: data.tier,
    cpu,
    ram,
    storage,
    packageId: data.packageId,
    name: data.name,
    createdAt: now,
    updatedAt: now,
  };
  await store.create('savedConfigurations', config as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'create', resource: 'savedConfigurations', resourceId: config.id, ip: guard.ip });
  return ok({ config }, 201);
}
