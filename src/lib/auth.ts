import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { read } from "./db";
import type { Role, User } from "./types";

const COOKIE = "wangstore_session";
const CSRF_COOKIE = "wangstore_csrf";
const MAX_AGE = 60 * 60 * 8;

function secret(): Uint8Array {
  const value =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "wangstore-development-secret-change-me-in-production-32chars";
  return new TextEncoder().encode(value);
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

export async function createSession(user: User) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer("wangstore")
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  jar.set(CSRF_COOKIE, crypto.randomUUID(), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete(CSRF_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: "wangstore" });
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

const RANK: Record<Role, number> = { STAFF: 1, ADMIN: 2, OWNER: 3 };

export function can(role: Role | undefined, required: Role): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[required];
}

export async function requireRole(required: Role): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !can(session.role, required)) {
    throw new AuthError("Tidak memiliki izin untuk tindakan ini.");
  }
  return session;
}

export class AuthError extends Error {}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const db = await read();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Constant-ish work factor to avoid user enumeration through timing.
    await bcrypt.compare(password, "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
