/**
 * DataStore abstraction — a single data access layer over either
 * Supabase (production) or the local JSON datastore (local dev fallback).
 *
 * Business logic lives in lib modules and is storage-agnostic.
 */

export const COLLECTIONS = [
  'users',
  'profiles',
  'roles',
  'orders',
  'orderItems',
  'products',
  'packages',
  'pricingRules',
  'coupons',
  'couponUsages',
  'savedConfigurations',
  'tickets',
  'ticketMessages',
  'notifications',
  'blogPosts',
  'blogCategories',
  'blogTags',
  'knowledgeArticles',
  'faqItems',
  'testimonials',
  'pages',
  'legalDocuments',
  'incidents',
  'maintenanceWindows',
  'announcements',
  'auditLogs',
  'vpsPackages',
  'vpsLocations',
  'serviceInstances',
  'serviceRenewals',
  'serviceReminders',
  'siteSettings',
  'verificationTokens',
  'passwordResetTokens',
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

/** Every persisted record has at least an `id`. */
export interface Entity {
  id: string;
  [key: string]: unknown;
}

export type CollectionItem = { id: string; [key: string]: unknown };

type WithId = { id: string };

export interface DataStore {
  /** List all records in a collection. */
  list<T extends WithId>(collection: CollectionName): Promise<T[]>;
  /** Get a single record by id, or null. */
  get<T extends WithId>(collection: CollectionName, id: string): Promise<T | null>;
  /** Insert a record (assigns id if not present). */
  create<T extends WithId>(collection: CollectionName, data: T): Promise<T>;
  /** Replace a record by id; returns null if not found. */
  update<T extends WithId>(collection: CollectionName, id: string, data: Partial<T>): Promise<T | null>;
  /** Remove a record by id; returns true if deleted. */
  delete(collection: CollectionName, id: string): Promise<boolean>;
  /** Count records in a collection. */
  count(collection: CollectionName): Promise<number>;
  /**
   * Run a multi-step mutation atomically (transaction). Not all backends
   * support true transactions; the JSON store serializes writes.
   */
  transaction<T>(fn: (tx: DataStore) => Promise<T>): Promise<T>;
  /** Idempotency helper: run fn if the collection is empty (used for seeding). */
  isSeeded(collection: CollectionName): Promise<boolean>;
}

export const collections = COLLECTIONS;
