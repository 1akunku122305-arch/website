import { ok, fail, readJson, writeAudit, runRequestGuard, requirePermissionResponse } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { z } from 'zod';
import { LOW_PRICE } from '@/lib/pricing/low';
import { TIERS } from '@/lib/pricing/tiers';
import { HIGH_PACKAGES } from '@/lib/pricing/packages';
import type { PricingRule } from '@/lib/pricing/rules';

export const runtime = 'nodejs';

const patchSchema = z.object({
  mediumStatus: z.enum(['available', 'ongoing', 'maintenance']).optional(),
  low: z
    .object({
      base: z.number().int().min(0).optional(),
      perCore: z.number().int().min(0).optional(),
      perGbRam: z.number().int().min(0).optional(),
      perGbStorage: z.number().int().min(0).optional(),
      roundTo: z.number().int().min(1).optional(),
      minPrice: z.number().int().min(0).optional(),
    })
    .optional(),
});

export async function GET(_request: Request) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'pricing:read');
  if (denied) return denied;

  const store = await getDatastore();
  const rules = await store.list<PricingRule>('pricingRules');

  return ok({
    tiers: {
      low: { ...TIERS.low, status: rules.find((r) => r.tier === 'low')?.status ?? TIERS.low.status },
      medium: { ...TIERS.medium, status: rules.find((r) => r.tier === 'medium')?.status ?? TIERS.medium.status },
      high: { ...TIERS.high, status: rules.find((r) => r.tier === 'high')?.status ?? TIERS.high.status },
    },
    lowFormula: LOW_PRICE,
    highPackages: HIGH_PACKAGES,
  });
}

export async function PATCH(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const denied = requirePermissionResponse(guard.session.role, 'pricing:write');
  if (denied) return denied;

  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tidak valid.', 422, parsed.error.flatten());
  const { mediumStatus, low } = parsed.data;

  const store = await getDatastore();
  const now = new Date().toISOString();
  const rules = await store.list<PricingRule>('pricingRules');
  const changes: Record<string, unknown> = {};

  if (mediumStatus) {
    const rule = rules.find((r) => r.tier === 'medium');
    if (rule) {
      await store.update('pricingRules', rule.id, { status: mediumStatus, updatedAt: now } as never);
    } else {
      await store.create('pricingRules', { id: 'rule_medium', tier: 'medium', type: 'package', status: mediumStatus, active: true, createdAt: now, updatedAt: now } as never);
    }
    changes.mediumStatus = mediumStatus;
  }

  if (low) {
    const rule = rules.find((r) => r.tier === 'low');
    if (rule) {
      await store.update('pricingRules', rule.id, { ...low, updatedAt: now } as never);
    } else {
      await store.create('pricingRules', { id: 'rule_low', tier: 'low', type: 'custom', ...low, active: true, createdAt: now, updatedAt: now } as never);
    }
    changes.low = low;
  }

  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'pricing_change', resource: 'pricingRules', ip: guard.ip, metadata: changes });
  return ok({ message: 'Formula harga diperbarui.', changes });
}
