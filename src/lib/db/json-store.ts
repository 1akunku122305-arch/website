import * as fs from 'fs';
import * as path from 'path';
import { generateId } from '@/lib/utils';
import {
  COLLECTIONS,
  type CollectionItem,
  type CollectionName,
  type DataStore,
} from './types';

/**
 * Local JSON datastore — LOCAL DEVELOPMENT / FALLBACK ONLY.
 *
 * Guarantees:
 *  - atomic writes (temp file + rename)
 *  - serialized write queue (no interleaved partial writes)
 *  - automatic seed on first run
 *  - safe file handling
 *
 * It is NOT a production datastore and must never be used in production
 * (see getDatastore() which fails explicitly when production is not configured).
 */

export const DEFAULT_DATA_DIR = path.join(process.cwd(), 'data');

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function isRunningOnVercel(): boolean {
  return process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL_ENV !== undefined;
}

export class JsonDataStore implements DataStore {
  private dir: string;
  private cache = new Map<CollectionName, CollectionItem[]>();
  private loaded = new Set<CollectionName>();
  /** Promise chain enforcing a serialized write queue. */
  private writeQueue: Promise<unknown> = Promise.resolve();
  /** True while a transaction holds the write lock (inner writes skip locking). */
  private inTransaction = false;
  private seeder?: () => Promise<void>;

  constructor(dir: string = DEFAULT_DATA_DIR) {
    this.dir = dir;
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  /** Called after construction to provide seed data. */
  setSeeder(fn: () => Promise<void>): void {
    this.seeder = fn;
  }

  private filePath(collection: CollectionName): string {
    return path.join(this.dir, `${collection}.json`);
  }

  private async load(collection: CollectionName): Promise<CollectionItem[]> {
    if (this.loaded.has(collection)) {
      return this.cache.get(collection) ?? [];
    }
    const raw = readFileSafe(this.filePath(collection));
    let items: CollectionItem[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed as CollectionItem[];
      } catch {
        items = [];
      }
    }
    this.cache.set(collection, items);
    this.loaded.add(collection);
    return items;
  }

  /** Serialized atomic write to disk. */
  private persist(collection: CollectionName): Promise<void> {
    const items = this.cache.get(collection) ?? [];
    const flush = async () => {
      const tmp = this.filePath(collection) + '.tmp';
      const data = JSON.stringify(items, null, 2);
      // Write to temp then rename for atomicity.
      await fs.promises.writeFile(tmp, data, 'utf8');
      await fs.promises.rename(tmp, this.filePath(collection));
    };
    // Inside a transaction the lock is already held → write immediately.
    if (this.inTransaction) return flush();
    return this.withWriteLock(flush);
  }

  /** Acquire the serialized write lock (no-op when already in a transaction). */
  private async withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
    if (this.inTransaction) return fn();
    const prev = this.writeQueue;
    let release: () => void = () => {};
    this.writeQueue = new Promise<void>((r) => (release = r));
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  async list<T extends CollectionItem>(collection: CollectionName): Promise<T[]> {
    const items = await this.load(collection);
    return items.map((i) => ({ ...i }) as T);
  }

  async get<T extends CollectionItem>(collection: CollectionName, id: string): Promise<T | null> {
    const items = await this.load(collection);
    const found = items.find((i) => i.id === id);
    return found ? ({ ...found } as T) : null;
  }

  async find<T extends CollectionItem>(collection: CollectionName, where: Partial<T>): Promise<T | null> {
    const items = await this.load(collection);
    const found = items.find((i) =>
      Object.entries(where).every(([k, v]) => i[k] === v),
    );
    return found ? ({ ...found } as T) : null;
  }

  async create<T extends CollectionItem>(collection: CollectionName, data: T): Promise<T> {
    const items = await this.load(collection);
    const record = { ...data };
    if (!record.id) record.id = generateId(collection);
    items.push(record);
    this.cache.set(collection, items);
    await this.persist(collection);
    return { ...record } as T;
  }

  async update<T extends CollectionItem>(
    collection: CollectionName,
    id: string,
    data: Partial<T>,
  ): Promise<T | null> {
    const items = await this.load(collection);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data, id } as CollectionItem;
    this.cache.set(collection, items);
    await this.persist(collection);
    return { ...items[idx] } as T;
  }

  async delete(collection: CollectionName, id: string): Promise<boolean> {
    const items = await this.load(collection);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    this.cache.set(collection, items);
    await this.persist(collection);
    return true;
  }

  async count(collection: CollectionName): Promise<number> {
    const items = await this.load(collection);
    return items.length;
  }

  async transaction<T>(fn: (tx: DataStore) => Promise<T>): Promise<T> {
    // Serialize the whole transaction; inner writes skip locking because the
    // lock is already held, so the callback cannot deadlock on itself.
    return this.withWriteLock(async () => {
      this.inTransaction = true;
      try {
        return await fn(this);
      } finally {
        this.inTransaction = false;
      }
    });
  }

  async isSeeded(collection: CollectionName): Promise<boolean> {
    return (await this.count(collection)) > 0;
  }

  /** Seed all collections if empty. Idempotent. */
  async ensureSeeded(): Promise<void> {
    if (this.seeder) {
      await this.seeder();
    }
  }

  /** Assert the store is safe to use (not production/vercel). */
  assertSafe(): void {
    if (isRunningOnVercel()) {
      throw new Error(
        'JsonDataStore is not allowed in production/preview. Configure a production datastore (Supabase) or unset VERCEL env for local development.',
      );
    }
  }
}

let instance: JsonDataStore | null = null;

/** Lazily create a seeded JSON store. Local dev only. */
export function getJsonStore(): JsonDataStore {
  if (instance) return instance;
  const store = new JsonDataStore(process.env.WANGSTORE_DATA_DIR || DEFAULT_DATA_DIR);
  store.assertSafe();
  instance = store;
  return store;
}
