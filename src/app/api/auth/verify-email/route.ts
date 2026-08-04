import { NextRequest } from "next/server";
import { read, write } from "@/lib/db";
import { handleError, ok, fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return fail("Token tidak valid", 400);

    const db = await read();
    const userIndex = db.users.findIndex(u => u.emailVerificationToken === token);

    if (userIndex === -1) {
      return fail("Token tidak valid atau sudah kadaluarsa", 400);
    }

    db.users[userIndex].emailVerified = true;
    db.users[userIndex].emailVerificationToken = undefined;

    await write((d) => {
      d.users = db.users;
    });

    return ok({ message: "Email berhasil diverifikasi!" });
  } catch (error) {
    return handleError(error);
  }
}
