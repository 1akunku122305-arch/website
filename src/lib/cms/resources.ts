import { z } from 'zod';
import type { CollectionName } from '@/lib/db/types';
import type { Permission } from '@/lib/auth/rbac';
import {
  cmsPageSchema,
  cmsFaqSchema,
  cmsTestimonialSchema,
  cmsBlogSchema,
  cmsKnowledgeSchema,
  cmsLegalSchema,
  cmsAnnouncementSchema,
  cmsIncidentSchema,
  cmsMaintenanceSchema,
} from '@/lib/validation/schemas';

/**
 * Generic CMS resource map — one handler serves every resource below.
 * Each resource defines its collection, identity field, allowed fields,
 * validation schema, and the minimum permission required to modify it.
 */

export interface CmsResource {
  key: string;
  label: string;
  collection: CollectionName;
  /** Field that identifies the record (must be unique per resource). */
  identityField: string;
  /** Fields admin may write (whitelist — never accept arbitrary keys). */
  allowedFields: string[];
  schema: z.ZodTypeAny;
  /** Permission required to read. */
  readPermission: Permission;
  /** Permission required to write. */
  writePermission: Permission;
  /** Human-readable audit resource name. */
  auditResource: string;
}

export const CMS_RESOURCES: CmsResource[] = [
  {
    key: 'pages', label: 'Halaman', collection: 'pages', identityField: 'key',
    allowedFields: ['title', 'content', 'seoTitle', 'seoDescription'],
    schema: cmsPageSchema, readPermission: 'cms:read', writePermission: 'cms:write',
    auditResource: 'cms_pages',
  },
  {
    key: 'faq', label: 'FAQ', collection: 'faqItems', identityField: 'id',
    allowedFields: ['question', 'answer', 'category', 'order', 'published'],
    schema: cmsFaqSchema, readPermission: 'cms:read', writePermission: 'cms:write',
    auditResource: 'cms_faq',
  },
  {
    key: 'testimonials', label: 'Testimoni', collection: 'testimonials', identityField: 'id',
    allowedFields: ['name', 'role', 'content', 'rating', 'published'],
    schema: cmsTestimonialSchema, readPermission: 'cms:read', writePermission: 'cms:write',
    auditResource: 'cms_testimonials',
  },
  {
    key: 'blog', label: 'Blog', collection: 'blogPosts', identityField: 'slug',
    allowedFields: ['title', 'slug', 'excerpt', 'content', 'categoryId', 'tags', 'author', 'status', 'featured', 'publishedAt'],
    schema: cmsBlogSchema, readPermission: 'cms:read', writePermission: 'cms:write',
    auditResource: 'cms_blog',
  },
  {
    key: 'knowledgeBase', label: 'Knowledge Base', collection: 'knowledgeArticles', identityField: 'slug',
    allowedFields: ['title', 'slug', 'excerpt', 'content', 'category', 'tags', 'status'],
    schema: cmsKnowledgeSchema, readPermission: 'cms:read', writePermission: 'cms:write',
    auditResource: 'cms_knowledge',
  },
  {
    key: 'legal', label: 'Dokumen Legal', collection: 'legalDocuments', identityField: 'slug',
    allowedFields: ['title', 'content', 'seoTitle', 'seoDescription'],
    schema: cmsLegalSchema, readPermission: 'cms:read', writePermission: 'legal:write',
    auditResource: 'cms_legal',
  },
  {
    key: 'announcements', label: 'Pengumuman', collection: 'announcements', identityField: 'id',
    allowedFields: ['title', 'body', 'published'],
    schema: cmsAnnouncementSchema, readPermission: 'cms:read', writePermission: 'cms:write',
    auditResource: 'cms_announcements',
  },
  {
    key: 'incidents', label: 'Insiden', collection: 'incidents', identityField: 'id',
    allowedFields: ['title', 'status', 'severity', 'message', 'startedAt', 'resolvedAt'],
    schema: cmsIncidentSchema, readPermission: 'status:read', writePermission: 'status:write',
    auditResource: 'incidents',
  },
  {
    key: 'maintenance', label: 'Maintenance', collection: 'maintenanceWindows', identityField: 'id',
    allowedFields: ['title', 'message', 'scheduledStart', 'scheduledEnd', 'status'],
    schema: cmsMaintenanceSchema, readPermission: 'status:read', writePermission: 'status:write',
    auditResource: 'maintenance',
  },
];

export const CMS_RESOURCE_MAP: ReadonlyMap<string, CmsResource> = new Map(
  CMS_RESOURCES.map((r) => [r.key, r]),
);

export function getCmsResource(key: string): CmsResource | null {
  return CMS_RESOURCE_MAP.get(key) ?? null;
}

export function isAllowedField(resource: CmsResource, field: string): boolean {
  return resource.allowedFields.includes(field);
}
