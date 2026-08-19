import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { COLLECTIONS, type CollectionItem, type CollectionName, type DataStore } from './types';

// ── camelCase ↔ snake_case helpers ──────────────────────────────────────────

function toSnake(str: string): string {
  return str.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnakeObj(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[toSnake(k)] = v;
  }
  return out;
}

function toCamelObj(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[toCamel(k)] = v;
  }
  return out;
}

function toCamelArr(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(toCamelObj);
}

/**
 * Supabase (PostgreSQL) datastore — PRODUCTION path.
 *
 * The service role key is used server-side only and is NEVER sent to the
 * browser. Row Level Security is defined in database/schema.sql.
 *
 * NOTE: this adapter is provided and documented, but has not been verified
 * against a live Supabase project in this environment. See docs/DEPLOYMENT.md.
 */

const TABLE_MAP: Record<CollectionName, string> = {
  users: 'users',
  profiles: 'profiles',
  roles: 'roles',
  orders: 'orders',
  orderItems: 'order_items',
  products: 'products',
  packages: 'packages',
  pricingRules: 'pricing_rules',
  coupons: 'coupons',
  couponUsages: 'coupon_usages',
  savedConfigurations: 'saved_configurations',
  tickets: 'tickets',
  ticketMessages: 'ticket_messages',
  notifications: 'notifications',
  blogPosts: 'blog_posts',
  blogCategories: 'blog_categories',
  blogTags: 'blog_tags',
  knowledgeArticles: 'knowledge_articles',
  faqItems: 'faq_items',
  testimonials: 'testimonials',
  pages: 'pages',
  legalDocuments: 'legal_documents',
  incidents: 'incidents',
  maintenanceWindows: 'maintenance_windows',
  announcements: 'announcements',
  auditLogs: 'audit_logs',
  vpsPackages: 'vps_packages',
  vpsLocations: 'vps_locations',
  serviceInstances: 'service_instances',
  serviceRenewals: 'service_renewals',
  serviceReminders: 'service_reminders',
  siteSettings: 'site_settings',
  verificationTokens: 'verification_tokens',
  passwordResetTokens: 'password_reset_tokens',
};

export class SupabaseDataStore implements DataStore {
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  private table(c: CollectionName) {
    return TABLE_MAP[c];
  }

  async list<T extends CollectionItem>(collection: CollectionName): Promise<T[]> {
    const { data, error } = await this.client.from(this.table(collection)).select('*');
    if (error) throw new Error(`Supabase list ${collection}: ${error.message}`);
    return toCamelArr((data ?? []) as Record<string, unknown>[]) as T[];
  }

  async get<T extends CollectionItem>(collection: CollectionName, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.table(collection))
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Supabase get ${collection}: ${error.message}`);
    return data ? (toCamelObj(data as Record<string, unknown>) as T) : null;
  }

  async create<T extends CollectionItem>(collection: CollectionName, data: T): Promise<T> {
    const { data: row, error } = await this.client
      .from(this.table(collection))
      .insert(toSnakeObj(data as unknown as Record<string, unknown>) as never)
      .select()
      .single();
    if (error) throw new Error(`Supabase create ${collection}: ${error.message}`);
    return toCamelObj(row as Record<string, unknown>) as T;
  }

  async update<T extends CollectionItem>(
    collection: CollectionName,
    id: string,
    data: Partial<T>,
  ): Promise<T | null> {
    const { data: row, error } = await this.client
      .from(this.table(collection))
      .update(toSnakeObj(data as unknown as Record<string, unknown>) as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Supabase update ${collection}: ${error.message}`);
    return row ? (toCamelObj(row as Record<string, unknown>) as T) : null;
  }

  async delete(collection: CollectionName, id: string): Promise<boolean> {
    const { error, data } = await this.client
      .from(this.table(collection))
      .delete()
      .eq('id', id)
      .select('id');
    if (error) throw new Error(`Supabase delete ${collection}: ${error.message}`);
    return Array.isArray(data) && data.length > 0;
  }

  async count(collection: CollectionName): Promise<number> {
    const { count, error } = await this.client
      .from(this.table(collection))
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(`Supabase count ${collection}: ${error.message}`);
    return count ?? 0;
  }

  async transaction<T>(fn: (tx: DataStore) => Promise<T>): Promise<T> {
    // Supabase REST has no generic client-side transaction. Run via a callback;
    // for multi-row atomic writes we rely on RPC triggers/constraints defined
    // in schema.sql, or the caller uses an idempotency key.
    return fn(this);
  }

  async isSeeded(collection: CollectionName): Promise<boolean> {
    return (await this.count(collection)) > 0;
  }
}

let instance: SupabaseDataStore | null = null;

export function getSupabaseStore(): SupabaseDataStore {
  if (instance) return instance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase datastore requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.',
    );
  }
  instance = new SupabaseDataStore(url, key);
  return instance;
}

export const supabaseTables = TABLE_MAP;

export function assertCollectionIsKnown(c: string): c is CollectionName {
  return (COLLECTIONS as readonly string[]).includes(c);
}
