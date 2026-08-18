import bcrypt from 'bcryptjs';

/**
 * Password hashing using bcrypt with cost 12.
 * bcryptjs is pure-JS and serverless/edge compatible.
 */

export const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Dummy hash used for timing-resistant responses on unknown emails. */
const DUMMY_HASH =
  '$2a$12$C6UzMDM.H6dfI/f/IKcEeO7WpZ8YpQmZqYpYz3rY1xHtGzQx3u1Wm';

export async function dummyCompare(): Promise<void> {
  await bcrypt.compare('invalid-password-for-timing', DUMMY_HASH);
}
