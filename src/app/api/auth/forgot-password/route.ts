import { NextRequest } from "next/server";
import { read, write, id } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { handleError, ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const db = await read();

    const user = db.users.find(u => u.email === email.toLowerCase());
    if (!user) return ok({ message: "If the email exists, a reset link has been sent" });

    const token = id("reset");
    // In real app, store token with expiry in DB
    // For now, we'll use a simple approach

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}&email=${email}`;

    await sendEmail(emailTemplates.resetPassword(user.name, resetLink));

    return ok({ message: "Reset link sent if email exists" });
  } catch (error) {
    return handleError(error);
  }
}
