import type { NextRequest } from "next/server";
import { assertSameOrigin, fail, handleError, limited, ok, parseJson } from "@/lib/api";
import { createSession, verifyCredentials } from "@/lib/auth";
import { audit } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const blocked = limited(req, "login", 6, 5 * 60_000);
    if (blocked) return blocked;

    const { email, password } = loginSchema.parse(await parseJson(req));
    const user = await verifyCredentials(email, password);

    if (!user) {
      await audit(email, "LOGIN_FAILED", "session");
      return fail("Email atau kata sandi salah.", 401);
    }

    await createSession(user);
    await audit(user.email, "LOGIN_SUCCESS", "session");
    return ok({ name: user.name, role: user.role });
  } catch (error) {
    return handleError(error);
  }
}
