import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { read, write } from "@/lib/db";
import { handleError, ok, fail } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return fail("Unauthorized", 401);

    const body = await req.json();
    const db = await read();

    const userIndex = db.users.findIndex(u => u.email === session.email);
    if (userIndex === -1) return fail("User not found", 404);

    // Update name and whatsapp
    if (body.name) db.users[userIndex].name = body.name;
    if (body.whatsapp) {
      // Store whatsapp in user object (add to type if needed)
      (db.users[userIndex] as any).whatsapp = body.whatsapp;
    }

    await write((d) => {
      d.users = db.users;
    });

    return ok({ message: "Profile updated successfully" });
  } catch (error) {
    return handleError(error);
  }
}
