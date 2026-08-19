import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { JsonDataStore } from '@/lib/db/json-store';
import type { DataStore } from '@/lib/db/types';
import {
  generateToken,
  hashToken,
  tokenExpiresAt,
  isExpired,
  EMAIL_VERIFY_TTL_MINUTES,
  PASSWORD_RESET_TTL_MINUTES,
} from '@/lib/auth/tokens';
import {
  createVerificationToken,
  verifyEmailToken,
  resendVerificationEmail,
  RESEND_COOLDOWN_SECONDS,
} from '@/lib/auth/verification';
import type { User, Profile, VerificationToken } from '@/lib/types';

function makeStore(): { store: DataStore; dir: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-verify-'));
  return { store: new JsonDataStore(dir), dir };
}

async function seedUser(store: DataStore, id = 'user_test', email = 'user@example.com'): Promise<User> {
  const now = new Date().toISOString();
  const user: User = {
    id,
    email,
    name: 'User Tes',
    passwordHash: 'x',
    role: 'customer',
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };
  const profile: Profile = {
    id: `profile_${id}`,
    userId: id,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };
  await store.create('users', user as never);
  await store.create('profiles', profile as never);
  return user;
}

/** Insert an unused token whose `createdAt` is old enough to pass the cooldown. */
async function seedPastToken(store: DataStore, userId: string, id: string, rawToken: string): Promise<void> {
  const record: VerificationToken = {
    id,
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: tokenExpiresAt(60),
    used: false,
    createdAt: new Date(Date.now() - (RESEND_COOLDOWN_SECONDS + 10) * 1000).toISOString(),
  };
  await store.create('verificationTokens', record as never);
}

describe('verification tokens (crypto)', () => {
  it('generateToken menghasilkan 64 karakter hex acak', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it('hashToken deterministik (SHA-256) dan bukan plaintext token', () => {
    const token = generateToken();
    const h1 = hashToken(token);
    const h2 = hashToken(token);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).not.toBe(token);
  });

  it('isExpired memakai waktu server', () => {
    expect(isExpired(tokenExpiresAt(60))).toBe(false);
    expect(isExpired(new Date(Date.now() - 1000).toISOString())).toBe(true);
  });

  it('TTL default verifikasi & reset = 60 menit', () => {
    expect(EMAIL_VERIFY_TTL_MINUTES).toBe(60);
    expect(PASSWORD_RESET_TTL_MINUTES).toBe(60);
  });
});

describe('email verification flow (JSON datastore)', () => {
  let store: DataStore;
  let dir: string;

  beforeEach(() => {
    ({ store, dir } = makeStore());
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('register → token dibuat, verifikasi berhasil menandai akun aktif', async () => {
    const user = await seedUser(store);
    const { token } = await createVerificationToken(store, user);

    const res = await verifyEmailToken(token, { store, skipAudit: true });
    expect(res.status).toBe('success');
    expect(res.email).toBe(user.email);

    const updated = await store.get<User>('users', user.id);
    expect(updated?.emailVerified).toBe(true);
    expect(updated?.emailVerifiedAt).toBeTruthy();

    const profile = await store.get<Profile>('profiles', `profile_${user.id}`);
    expect(profile?.emailVerified).toBe(true);
  });

  it('token hanya dapat dipakai satu kali (reuse → invalid)', async () => {
    const user = await seedUser(store);
    const { token } = await createVerificationToken(store, user);

    expect((await verifyEmailToken(token, { store, skipAudit: true })).status).toBe('success');
    const second = await verifyEmailToken(token, { store, skipAudit: true });
    expect(second.status).toBe('invalid');
  });

  it('token kedaluwarsa → expired, akun tetap belum terverifikasi', async () => {
    const user = await seedUser(store);
    const token = generateToken();
    await store.create('verificationTokens', {
      id: 'vtok_expired',
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    } as never);

    const res = await verifyEmailToken(token, { store, skipAudit: true });
    expect(res.status).toBe('expired');
    const updated = await store.get<User>('users', user.id);
    expect(updated?.emailVerified).toBe(false);
  });

  it('token acak / tidak dikenal → invalid', async () => {
    await seedUser(store);
    const res = await verifyEmailToken(generateToken(), { store, skipAudit: true });
    expect(res.status).toBe('invalid');
  });

  it('akun sudah terverifikasi dengan token valid → already_verified & token dikonsumsi', async () => {
    const user = await seedUser(store);
    await store.update('users', user.id, { emailVerified: true } as never);
    const { token } = await createVerificationToken(store, user);

    const res = await verifyEmailToken(token, { store, skipAudit: true });
    expect(res.status).toBe('already_verified');

    const second = await verifyEmailToken(token, { store, skipAudit: true });
    expect(second.status).toBe('invalid');
  });

  it('cooldown 60 detik: token yang baru dibuat memblokir kirim ulang', async () => {
    const user = await seedUser(store);
    await createVerificationToken(store, user); // baru saja "terkirim"

    const res = await resendVerificationEmail(store, user, '127.0.0.1');
    expect(res.ok).toBe(false);
    expect(res.code).toBe('cooldown');
    expect(res.retryAfterSeconds).toBeGreaterThan(0);
    expect(res.retryAfterSeconds).toBeLessThanOrEqual(RESEND_COOLDOWN_SECONDS);
  });

  it('kirim ulang setelah cooldown berhasil dan membatalkan token lama', async () => {
    const user = await seedUser(store);
    const firstToken = generateToken();
    await seedPastToken(store, user.id, 'vtok_old', firstToken);

    const resend = await resendVerificationEmail(store, user, '127.0.0.1');
    expect(resend.ok).toBe(true);

    // Token lama sudah invalid karena digantikan token baru (single active token).
    expect((await verifyEmailToken(firstToken, { store, skipAudit: true })).status).toBe('invalid');

    // Token baru masih bisa dipakai untuk verifikasi.
    const records = await store.list<VerificationToken>('verificationTokens');
    const active = records.filter((r) => !r.used);
    expect(active.length).toBe(1);
    expect(active[0]?.id).not.toBe('vtok_old');
  });

  it('rate limit per-IP membatasi permintaan kirim ulang lintas akun', async () => {
    const ip = '203.0.113.9';
    const users = await Promise.all(
      Array.from({ length: 6 }, (_, i) => seedUser(store, `user_${i}`, `user${i}@example.com`)),
    );
    for (const u of users) {
      await seedPastToken(store, u.id, `vtok_${u.id}`, generateToken());
    }

    let allowed = 0;
    for (const u of users) {
      const res = await resendVerificationEmail(store, u, ip);
      if (res.ok) allowed += 1;
      else {
        expect(res.code).toBe('rate_limited');
      }
    }
    // 5 dari 6 diizinkan (limit 5/jam per IP); sisanya ditolak.
    expect(allowed).toBe(5);
  });

  it('batas harian per-user (10 email) menolak permintaan berlebih', async () => {
    const user = await seedUser(store);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    for (let i = 0; i < 10; i++) {
      await store.create('verificationTokens', {
        id: `vtok_day_${i}`,
        userId: user.id,
        tokenHash: hashToken('day' + i),
        expiresAt: tokenExpiresAt(60),
        used: true,
        createdAt: new Date(dayStart.getTime() + 1000).toISOString(),
      } as never);
    }
    // Tambah token lama agar cooldown berlalu.
    await seedPastToken(store, user.id, 'vtok_past', generateToken());

    const res = await resendVerificationEmail(store, user, '198.51.100.7');
    expect(res.ok).toBe(false);
    expect(res.code).toBe('rate_limited');
  });
});
