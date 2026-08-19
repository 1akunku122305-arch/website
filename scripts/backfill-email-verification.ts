/**
 * Backfill aman untuk verifikasi email pada JSON datastore lokal.
 *
 * - Role internal (owner/admin/staff) ditandai terverifikasi (email_verified =
 *   true + email_verified_at) agar akses admin tidak terputus.
 * - Customer lama TIDAK diubah: mereka wajib memverifikasi email saat login
 *   berikutnya melalui halaman /verify-email (fitur kirim ulang tersedia).
 *
 * Untuk production (Supabase), backfill otomatis ada di database/schema.sql.
 *
 * Usage: npx tsx scripts/backfill-email-verification.ts
 */

import { getJsonStore } from '../src/lib/db/json-store';
import type { DataStore } from '../src/lib/db/types';
import type { Profile, User } from '../src/lib/types';

async function main() {
  const store: DataStore = getJsonStore();
  const users = await store.list<User>('users');
  const profiles = await store.list<Profile>('profiles');
  const now = new Date().toISOString();

  let updated = 0;
  for (const user of users) {
    if (user.role !== 'customer' && !user.emailVerified) {
      await store.update('users', user.id, {
        emailVerified: true,
        emailVerifiedAt: user.emailVerifiedAt ?? user.updatedAt ?? now,
        updatedAt: now,
      } as never);
      const profile = profiles.find((p) => p.userId === user.id);
      if (profile) {
        await store.update('profiles', profile.id, {
          emailVerified: true,
          emailVerifiedAt: profile.emailVerifiedAt ?? profile.updatedAt ?? now,
          updatedAt: now,
        } as never);
      }
      updated += 1;
    }
  }

  console.log(`Backfill verifikasi email selesai. ${updated} akun internal ditandai terverifikasi.`);
  console.log(`Customer lama tetap tidak terverifikasi (${users.filter((u) => u.role === 'customer' && !u.emailVerified).length} akun) — wajib verifikasi saat login.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
