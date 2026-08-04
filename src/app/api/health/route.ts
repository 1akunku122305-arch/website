import { handleError, ok } from "@/lib/api";
import { read } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Liveness + readiness probe used by install.sh, Docker healthcheck, and CI. */
export async function GET() {
  try {
    const db = await read();
    return ok({
      status: "healthy",
      version: process.env.npm_package_version ?? "1.0.0",
      uptimeSeconds: Math.round(process.uptime()),
      datastore: { nodes: db.nodes.length, posts: db.posts.length, orders: db.orders.length },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}
