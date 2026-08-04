import { promises as fs } from "node:fs";
import path from "node:path";
import { seedDatabase } from "./seed";
import type { Database } from "./types";

/**
 * File-backed JSON datastore with an in-process write queue.
 *
 * The platform ships with this zero-dependency store so a fresh clone boots and
 * every module (orders, CMS, tickets, audit) is fully functional without any
 * external service. The Prisma/PostgreSQL schema in `database/` mirrors the same
 * shape for deployments that opt into the containerised stack (see docs/DEPLOYMENT.md).
 */

const DATA_DIR = process.env.WANGSTORE_DATA_DIR
  ? path.resolve(process.env.WANGSTORE_DATA_DIR)
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "wangstore.json");

let cache: Database | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Database> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cache = JSON.parse(raw) as Database;
  } catch {
    cache = seedDatabase();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2), "utf8");
  }
  return cache;
}

async function persist(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

/** Read-only snapshot of the database. */
export async function read(): Promise<Database> {
  return load();
}

/** Serialised read-modify-write transaction. */
export function write<T>(mutator: (db: Database) => T | Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    const db = await load();
    const result = await mutator(db);
    cache = db;
    await persist(db);
    return result;
  });
  queue = next.catch(() => undefined);
  return next;
}

export function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function audit(actor: string, action: string, target: string) {
  await write((db) => {
    db.audit.unshift({ id: id("log"), at: new Date().toISOString(), actor, action, target });
    db.audit = db.audit.slice(0, 500);
  });
}
