import { handleError, ok } from "@/lib/api";
import { read } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await read();
    const operational = db.nodes.filter((n) => n.status === "OPERATIONAL").length;
    const overall =
      db.nodes.some((n) => n.status === "DOWN")
        ? "MAJOR_OUTAGE"
        : db.nodes.some((n) => n.status === "DEGRADED")
          ? "DEGRADED"
          : db.nodes.some((n) => n.status === "MAINTENANCE")
            ? "MAINTENANCE"
            : "OPERATIONAL";

    return ok({
      overall,
      operational,
      total: db.nodes.length,
      averageUptime:
        Math.round((db.nodes.reduce((s, n) => s + n.uptime30d, 0) / Math.max(1, db.nodes.length)) * 100) / 100,
      nodes: db.nodes,
      incidents: db.incidents,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}
