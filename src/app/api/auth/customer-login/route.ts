import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { read } from "@/lib/db";
import { handleError, ok, fail, parseJson } from "@/lib/api";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await parseJson(req));
    const db = await read();

    const user = db.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    
    if (!user) {
      return fail("Email tidak ditemukan", 401);
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return fail("Password salah", 401);
    }

    // Create customer session (simplified - using JWT)
    return ok({ 
      message: "Login berhasil",
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
