import { getJsonStore, JsonDataStore } from './json-store';
import { seedDatastore } from './seed';
import { getSupabaseStore, type SupabaseDataStore } from './supabase';
import type { DataStore } from './types';

/**
 * Datastore provider.
 *
 * Production/preview → Supabase (PostgreSQL).
 * Local development   → JSON datastore fallback (when Supabase is not configured).
 *
 * The JSON fallback is explicitly forbidden in production/preview:
 * if the app is running on Vercel without a configured Supabase connection,
 * getDatastore() fails with a clear configuration error.
 */

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

let jsonStore: JsonDataStore | null = null;
let supabaseStore: SupabaseDataStore | null = null;

/**
 * Get the active datastore, seeding it on first use (JSON fallback only).
 * Use a separate server-side flag to avoid seeding Supabase via the fallback.
 */
export async function getDatastore(): Promise<DataStore> {
  const onVercel = process.env.VERCEL === '1' || Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);

  if (hasSupabaseConfig() || onVercel) {
    if (!hasSupabaseConfig()) {
      throw new Error(
        'Production/preview requires a configured Supabase datastore. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (and run database/schema.sql), or run locally without Vercel for the JSON fallback.',
      );
    }
    if (!supabaseStore) {
      supabaseStore = getSupabaseStore();
    }
    return supabaseStore;
  }

  if (!jsonStore) {
    jsonStore = getJsonStore();
    jsonStore.setSeeder(async () => {
      await seedDatastore(jsonStore as unknown as DataStore, {
        createAdmin: Boolean(process.env.WANGSTORE_ADMIN_EMAIL && process.env.WANGSTORE_ADMIN_PASSWORD),
        adminEmail: process.env.WANGSTORE_ADMIN_EMAIL,
        adminPassword: process.env.WANGSTORE_ADMIN_PASSWORD,
      });
    });
    await jsonStore.ensureSeeded();
  }
  return jsonStore;
}

/** Sync-ish helper for route handlers that need the store immediately. */
export { getJsonStore, JsonDataStore };
