/**
 * Seed datastore (local JSON fallback).
 * Usage: npm run db:seed
 */

import { getJsonStore } from '../src/lib/db/json-store';
import { seedDatastore } from '../src/lib/db/seed';

async function main() {
  const store = getJsonStore();
  await seedDatastore(store as never, {
    createAdmin: Boolean(process.env.WANGSTORE_ADMIN_EMAIL && process.env.WANGSTORE_ADMIN_PASSWORD),
    adminEmail: process.env.WANGSTORE_ADMIN_EMAIL,
    adminPassword: process.env.WANGSTORE_ADMIN_PASSWORD,
  });
  console.log('Seeding selesai. Data ditulis ke ./data');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
