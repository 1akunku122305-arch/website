import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { id, read, write } from "@/lib/db";
import { handleError, ok, fail, parseJson } from "@/lib/api";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(9),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = registerSchema.parse(await parseJson(req));
    const db = await read();

    const exists = db.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (exists) {
      return fail("Email sudah terdaftar", 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const newUser = {
      id: id("usr"),
      email: body.email.toLowerCase(),
      name: body.name,
      role: "STAFF" as const, // Default role untuk pelanggan
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await write((d) => {
      d.users.push(newUser);
    });

    return ok({ message: "Akun berhasil dibuat" });
  } catch (error) {
    return handleError(error);
  }
}
