import type { NextRequest } from "next/server";
import { z } from "zod";
import { assertSameOrigin, fail, handleError, limited, ok, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { id, read, write } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";
import type { Database, Role } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Generic CMS endpoint backing every dashboard module.
 *
 * Each resource declares the collection key, the identifier field, and the
 * minimum role required to mutate it, so new modules never need bespoke routes.
 */
type Collection = Exclude<keyof Database, "settings" | "priceFormula" | "users">;

interface ResourceConfig {
  key: Collection;
  idField: string;
  prefix: string;
  write: Role;
}

const RESOURCES: Record<string, ResourceConfig> = {
  orders: { key: "orders", idField: "id", prefix: "ord", write: "STAFF" },
  tickets: { key: "tickets", idField: "id", prefix: "tkt", write: "STAFF" },
  coupons: { key: "coupons", idField: "code", prefix: "cpn", write: "ADMIN" },
  posts: { key: "posts", idField: "slug", prefix: "post", write: "ADMIN" },
  articles: { key: "articles", idField: "slug", prefix: "kb", write: "ADMIN" },
  faqs: { key: "faqs", idField: "id", prefix: "faq", write: "ADMIN" },
  nodes: { key: "nodes", idField: "id", prefix: "node", write: "ADMIN" },
  regions: { key: "regions", idField: "id", prefix: "reg", write: "ADMIN" },
  incidents: { key: "incidents", idField: "id", prefix: "inc", write: "ADMIN" },
  announcements: { key: "announcements", idField: "id", prefix: "ann", write: "ADMIN" },
  testimonials: { key: "testimonials", idField: "name", prefix: "tst", write: "ADMIN" },
};

type Row = Record<string, unknown>;

/** Recursively sanitises every string in an untrusted payload. */
function clean(value: unknown): unknown {
  if (typeof value === "string") return sanitizeText(value).slice(0, 20_000);
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Row).map(([k, v]) => [k, clean(v)]));
  }
  return value;
}

const payloadSchema = z.object({
  item: z.record(z.string(), z.unknown()).optional(),
  id: z.string().max(120).optional(),
});

function collectionOf(db: Database, key: Collection): Row[] {
  return db[key] as unknown as Row[];
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  try {
    await requireRole("STAFF");
    const { resource } = await ctx.params;

    const db = await read();
    if (resource === "settings") return ok({ settings: db.settings, priceFormula: db.priceFormula });
    if (resource === "audit") return ok({ items: db.audit });
    if (resource === "analytics") {
      const revenue = db.orders.reduce((sum, o) => sum + o.total, 0);
      return ok({
        orders: db.orders.length,
        revenue,
        openTickets: db.tickets.filter((t) => t.status === "OPEN").length,
        customers: new Set(db.orders.map((o) => o.customer.email)).size,
        averageOrder: db.orders.length ? Math.round(revenue / db.orders.length) : 0,
        byStatus: db.orders.reduce<Record<string, number>>((acc, o) => {
          acc[o.status] = (acc[o.status] ?? 0) + 1;
          return acc;
        }, {}),
      });
    }

    const config = RESOURCES[resource];
    if (!config) return fail("Resource tidak dikenal.", 404);
    return ok({ items: collectionOf(db, config.key) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  try {
    assertSameOrigin(req);
    const blocked = limited(req, "admin-write", 120, 60_000);
    if (blocked) return blocked;

    const { resource } = await ctx.params;
    const body = payloadSchema.parse(await parseJson(req));
    const item = clean(body.item ?? {}) as Row;

    if (resource === "settings") {
      const session = await requireRole("ADMIN");
      await write((db) => {
        if (item.settings) db.settings = { ...db.settings, ...(item.settings as object) };
        if (item.priceFormula) db.priceFormula = { ...db.priceFormula, ...(item.priceFormula as object) };
        db.audit.unshift({
          id: id("log"),
          at: new Date().toISOString(),
          actor: session.email,
          action: "SETTINGS_UPDATED",
          target: Object.keys(item).join(","),
        });
      });
      return ok({ updated: true });
    }

    const config = RESOURCES[resource];
    if (!config) return fail("Resource tidak dikenal.", 404);
    const session = await requireRole(config.write);

    const key = String(item[config.idField] ?? "").trim();
    if (!key && config.idField !== "id") return fail(`Field ${config.idField} wajib diisi.`, 422);

    const identifier = key || id(config.prefix);
    item[config.idField] = identifier;

    const action = await write((db) => {
      const list = collectionOf(db, config.key);
      const index = list.findIndex((row) => String(row[config.idField]) === identifier);
      if (index >= 0) {
        list[index] = { ...list[index], ...item };
        return "UPDATED";
      }
      list.unshift(item);
      return "CREATED";
    });

    await write((db) => {
      db.audit.unshift({
        id: id("log"),
        at: new Date().toISOString(),
        actor: session.email,
        action: `${resource.toUpperCase()}_${action}`,
        target: identifier,
      });
    });

    return ok({ id: identifier, action });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  try {
    assertSameOrigin(req);
    const { resource } = await ctx.params;
    const config = RESOURCES[resource];
    if (!config) return fail("Resource tidak dikenal.", 404);

    const session = await requireRole(config.write === "STAFF" ? "ADMIN" : config.write);
    const target = req.nextUrl.searchParams.get("id");
    if (!target) return fail("Parameter id wajib diisi.", 400);

    const removed = await write((db) => {
      const list = collectionOf(db, config.key);
      const index = list.findIndex((row) => String(row[config.idField]) === target);
      if (index < 0) return false;
      list.splice(index, 1);
      db.audit.unshift({
        id: id("log"),
        at: new Date().toISOString(),
        actor: session.email,
        action: `${resource.toUpperCase()}_DELETED`,
        target,
      });
      return true;
    });

    if (!removed) return fail("Data tidak ditemukan.", 404);
    return ok({ deleted: target });
  } catch (error) {
    return handleError(error);
  }
}
