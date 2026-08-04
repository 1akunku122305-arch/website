import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { read, write } from "@/lib/db";
import { handleError, ok, fail } from "@/lib/api";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return fail("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) return fail("No file uploaded", 400);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return fail("Only images are allowed", 400);
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return fail("File too large (max 2MB)", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${session.sub}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads/avatars");
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filepath, buffer);

    // Save to database
    const db = await read();
    const userIndex = db.users.findIndex(u => u.email === session.email);
    if (userIndex === -1) return fail("User not found", 404);

    db.users[userIndex].avatar = `/uploads/avatars/${filename}`;

    await write((d) => {
      d.users = db.users;
    });

    return ok({ 
      message: "Avatar uploaded successfully",
      avatar: db.users[userIndex].avatar 
    });
  } catch (error) {
    return handleError(error);
  }
}
