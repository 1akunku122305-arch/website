import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { read, write, id } from "@/lib/db";
import { handleError, ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return fail("Unauthorized", 401);

    const db = await read();
    const userIndex = db.users.findIndex(u => u.email === session.email);
    if (userIndex === -1) return fail("User not found", 404);

    const user = db.users[userIndex];
    
    if (user.emailVerified) {
      return ok({ message: "Email sudah terverifikasi" });
    }

    // Generate verification token
    const token = id("verify");
    db.users[userIndex].emailVerificationToken = token;

    await write((d) => {
      d.users = db.users;
    });

    // TODO: Send actual email (currently returns the link for demo)
    const verificationLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}`;

    return ok({ 
      message: "Link verifikasi telah dibuat",
      verificationLink // In production, send via email instead
    });
  } catch (error) {
    return handleError(error);
  }
}
