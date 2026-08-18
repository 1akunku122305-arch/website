import type { DataStore } from './types';
import { generateId } from '@/lib/utils';
import { hashPassword } from '@/lib/auth/password';
import { HIGH_PACKAGES } from '@/lib/pricing/packages';
import { TIERS } from '@/lib/pricing/tiers';
import { seedContent } from './seed-content';

/**
 * Automatic, idempotent seeding of non-user content into any DataStore.
 * Runs on first use so `npm run dev` works out of the box.
 */

function nowIso(): string {
  return new Date().toISOString();
}

function createRoles() {
  return [
    { id: 'role_owner', name: 'Owner', key: 'owner' },
    { id: 'role_admin', name: 'Admin', key: 'admin' },
    { id: 'role_staff', name: 'Staff', key: 'staff' },
    { id: 'role_customer', name: 'Customer', key: 'customer' },
  ];
}

function createProducts() {
  return [
    {
      id: 'product_server_builder',
      name: 'Server Builder',
      slug: 'server-builder',
      description: 'Layanan hosting server yang dikonfigurasi melalui Server Builder.',
      serviceType: 'server_builder',
      status: 'active',
      visibility: 'public',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'product_vps',
      name: 'VPS Package',
      slug: 'vps',
      description: 'Paket VPS (Virtual Private Server) dengan spesifikasi tetap.',
      serviceType: 'vps_package',
      status: 'active',
      visibility: 'public',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];
}

function createPackages() {
  return HIGH_PACKAGES.map((p) => ({
    id: p.id,
    productId: 'product_server_builder',
    tier: 'high',
    cpu: p.cpu,
    ram: p.ram,
    storage: p.storage,
    price: p.price,
    orderable: true,
    metadata: { label: p.label, popular: p.popular },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }));
}

function createPricingRules() {
  return [
    {
      id: 'rule_low',
      tier: 'low',
      type: 'custom',
      base: 5000,
      perCore: 7000,
      perGbRam: 4500,
      perGbStorage: 300,
      roundTo: 500,
      minPrice: 45000,
      active: true,
    },
    {
      id: 'rule_medium',
      tier: 'medium',
      type: 'package',
      status: 'ongoing',
      active: false,
    },
    {
      id: 'rule_high',
      tier: 'high',
      type: 'package',
      active: true,
    },
  ];
}

function createVpsLocations() {
  return [
    { id: 'loc_jkt1', name: 'Jakarta 1', country: 'Indonesia', city: 'Jakarta', status: 'inactive' },
    { id: 'loc_sg1', name: 'Singapore 1', country: 'Singapore', city: 'Singapore', status: 'inactive' },
  ].map((l) => ({ ...l, createdAt: nowIso(), updatedAt: nowIso() }));
}

export interface SeedOptions {
  adminEmail?: string;
  adminPassword?: string;
  createAdmin?: boolean;
}

/**
 * Seed the datastore. Safe to call repeatedly (skips non-empty collections).
 */
export async function seedDatastore(store: DataStore, options: SeedOptions = {}): Promise<void> {
  const ts = nowIso();

  await seedIfEmpty(store, 'roles', createRoles());
  await seedIfEmpty(store, 'products', createProducts());
  await seedIfEmpty(store, 'packages', createPackages());
  await seedIfEmpty(store, 'pricingRules', createPricingRules());
  await seedIfEmpty(store, 'vpsLocations', createVpsLocations());

  // CMS / content collections
  await seedContent(store);

  // Dev admin (owner) — local only, only when explicitly enabled.
  if (options.createAdmin && options.adminEmail && options.adminPassword) {
    await seedIfEmpty(store, 'users', [
      {
        id: 'user_admin',
        email: options.adminEmail,
        name: 'Administrator',
        passwordHash: await hashPassword(options.adminPassword),
        role: 'owner',
        emailVerified: true,
        createdAt: ts,
        updatedAt: ts,
      },
    ]);
  }

  // Track seed version marker.
  if ((await store.count('announcements')) === 0) {
    // announcements seeded by seedContent; nothing more to do.
  }
}

async function seedIfEmpty(
  store: DataStore,
  collection: 'roles' | 'products' | 'packages' | 'pricingRules' | 'vpsLocations' | 'users',
  rows: Array<Record<string, unknown>>,
): Promise<void> {
  if ((await store.count(collection)) > 0) return;
  for (const row of rows) {
    await store.create(collection as never, { id: row.id ?? generateId(), ...row } as never);
  }
}

export const tierStatuses: Record<string, string> = Object.fromEntries(
  (Object.keys(TIERS) as (keyof typeof TIERS)[]).map((id) => [id, TIERS[id]!.status]),
);
