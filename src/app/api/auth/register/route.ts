import { registerSchema } from '@/lib/validation/schemas';
import { readJson, fail, ok, writeAudit, generateId, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { signSession, setSessionCookie } from '@/lib/auth/session';
import { generateToken, hashToken, tokenExpiresAt } from '@/lib/auth/tokens';
import { emailConfigured, sendEmail } from '@/lib/email';
import { absoluteUrl } from '@/lib/seo';
import type { User, Profile } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'register' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail('validation_error', 'Data pendaftaran tidak valid.', 422, parsed.error.flatten());
  }
  const data = parsed.data;
  const name = data.name;
  const email = data.email;
  const password = data.password;
  const whatsapp = data.whatsapp;

  const store = await getDatastore();
  const existing = (await store.list<User>('users')).find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    // Do not leak whether the email exists.
    return fail('register_failed', 'Pendaftaran gagal. Silakan coba lagi.', 400);
  }

  const userId = generateId('user');
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const user: User = {
    id: userId,
    email: email.toLowerCase(),
    name,
    passwordHash,
    role: 'customer',
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  const profile: Profile = {
    id: generateId('prof'),
    userId,
    whatsapp: whatsapp || undefined,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  await store.transaction(async (tx) => {
    await tx.create('users', user as never);
    await tx.create('profiles', profile as never);
  });

  // Email verification token.
  const token = generateToken();
  await store.create('verificationTokens', {
    id: generateId('vtok'),
    userId,
    tokenHash: hashToken(token),
    expiresAt: tokenExpiresAt(24 * 60),
    used: false,
    createdAt: now,
  } as never);

  const verifyUrl = absoluteUrl(`/api/auth/verify-email?token=${token}`);
  const emailSvc = emailConfigured();
  if (emailSvc) {
    await sendEmail({ to: user.email, subject: 'Verifikasi Email WangStore', text: `Verifikasi: ${verifyUrl}` });
  }

  await writeAudit({ actorId: userId, actorRole: 'customer', action: 'create', resource: 'users', resourceId: userId, ip: guard.ip });

  const session = await signSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(session);

  return ok({
    user: { id: user.id, email: user.email, name: user.name, emailVerified: user.emailVerified },
    emailVerification: emailSvc
      ? { status: 'sent' }
      : { status: 'not_configured', message: 'Layanan email belum dikonfigurasi.', devVerifyUrl: verifyUrl },
  }, 201);
}
