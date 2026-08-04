import { handleError, ok } from "@/lib/api";
import { destroySession, getSession } from "@/lib/auth";
import { audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSession();
    if (session) await audit(session.email, "LOGOUT", "session");
    await destroySession();
    return ok({ loggedOut: true });
  } catch (error) {
    return handleError(error);
  }
}
