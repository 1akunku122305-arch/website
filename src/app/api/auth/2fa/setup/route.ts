import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { read, write } from "@/lib/db";
import { handleError, ok, fail } from "@/lib/api";
import * as speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return fail("Unauthorized", 401);

    const db = await read();
    const userIndex = db.users.findIndex(u => u.email === session.email);
    if (userIndex === -1) return fail("User not found", 404);

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `WangStore (${session.email})`,
      issuer: "WangStore",
    });

    db.users[userIndex].twoFactorSecret = secret.base32;
    db.users[userIndex].twoFactorEnabled = false; // Not enabled until verified

    await write((d) => {
      d.users = db.users;
    });

    return ok({
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
    });
  } catch (error) {
    return handleError(error);
  }
}
