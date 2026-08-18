import { z } from 'zod';
import { LOW_CONFIG } from '@/lib/pricing/low';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100),
  email: z.string().trim().email('Email tidak valid.').max(254),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter.').max(128),
  whatsapp: z.string().trim().max(20).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid.').max(254),
  password: z.string().min(1, 'Kata sandi wajib diisi.').max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Email tidak valid.').max(254),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter.').max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8, 'Kata sandi baru minimal 8 karakter.').max(128),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100).optional(),
  whatsapp: z.string().trim().max(20).optional().or(z.literal('')),
  discord: z.string().trim().max(60).optional().or(z.literal('')),
  bio: z.string().trim().max(500).optional().or(z.literal('')),
});

const tierEnum = z.enum(['low', 'medium', 'high']);

export const serverBuilderConfigSchema = z.object({
  tier: tierEnum,
  cpu: z.number().int().optional(),
  ram: z.number().int().optional(),
  storage: z.number().int().optional(),
  packageId: z.string().max(60).optional(),
});

/** Order payload — client price is deliberately absent; server recomputes it. */
export const orderSchema = z.object({
  tier: tierEnum,
  cpu: z.number().int().optional(),
  ram: z.number().int().optional(),
  storage: z.number().int().optional(),
  packageId: z.string().max(60).optional(),
  name: z.string().trim().min(2, 'Nama wajib diisi.').max(100),
  whatsapp: z.string().trim().min(8, 'Nomor WhatsApp wajib diisi.').max(20),
  email: z.string().trim().email('Email tidak valid.').max(254),
  serverName: z.string().trim().min(2, 'Nama server wajib diisi.').max(60),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
  couponCode: z.string().trim().max(60).optional().or(z.literal('')),
  agreed: z.boolean(),
  activationAt: z.string().datetime().optional(),
  durationDays: z.number().int().min(1).max(730).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  whatsapp: z.string().trim().max(20).optional().or(z.literal('')),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
});

export const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(4000),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
});

export const ticketReplySchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const renewalSchema = z.object({
  durationDays: z.number().int().min(1).max(730),
});

export const savedConfigSchema = z.object({
  name: z.string().trim().min(1).max(60),
  tier: tierEnum,
  cpu: z.number().int().optional(),
  ram: z.number().int().optional(),
  storage: z.number().int().optional(),
  packageId: z.string().max(60).optional(),
});

export const vpsPackageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  cpu: z.number().int().min(1).max(128),
  ram: z.number().int().min(1).max(1024),
  storage: z.number().int().min(10).max(100000),
  bandwidth: z.number().int().min(0).max(100000),
  locationId: z.string().min(1),
  price: z.number().int().min(0).max(100_000_000),
  billingPeriod: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']),
  renewable: z.boolean(),
  status: z.enum(['available', 'sold_out', 'maintenance', 'inactive']),
  visibility: z.enum(['public', 'hidden']),
  ipv4: z.boolean(),
  virtualization: z.string().max(40).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  features: z.array(z.string().max(100)).max(20).default([]),
  serviceDays: z.number().int().min(1).max(730),
});

/** Generic CMS resource schemas used by /api/admin/cms. */
export const cmsPageSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100_000),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
});

export const cmsFaqSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().min(1).max(5000),
  category: z.string().max(100).default('Umum'),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export const cmsTestimonialSchema = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.string().max(100).optional(),
  content: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  published: z.boolean().default(true),
});

export const cmsBlogSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  excerpt: z.string().max(500).default(''),
  content: z.string().max(100_000),
  categoryId: z.string().min(1),
  tags: z.array(z.string().max(50)).max(20).default([]),
  author: z.string().max(100).default('Tim WangStore'),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
});

export const cmsKnowledgeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  excerpt: z.string().max(500).default(''),
  content: z.string().max(100_000),
  category: z.string().max(100).default('Umum'),
  tags: z.array(z.string().max(50)).max(20).default([]),
  status: z.enum(['draft', 'published']).default('published'),
});

export const cmsLegalSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100_000),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
});

export const cmsAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().max(5000),
  published: z.boolean().default(true),
});

export const cmsIncidentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
  severity: z.enum(['minor', 'major', 'critical']).default('minor'),
  message: z.string().max(5000).default(''),
  startedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
});

export const cmsMaintenanceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  message: z.string().max(5000).default(''),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
});

export const LOW_VALIDATION = LOW_CONFIG;
