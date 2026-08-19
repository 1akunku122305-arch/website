import type { TierId } from '@/lib/pricing/tiers';

export type Role = 'owner' | 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  emailVerified: boolean;
  /** ISO timestamp when the email address was successfully verified. */
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  whatsapp?: string;
  discord?: string;
  phone?: string;
  company?: string;
  bio?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Single-use email verification token. Only the SHA-256 hash is stored. */
export interface VerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

/** Single-use password reset token. Only the SHA-256 hash is stored. */
export interface PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

export type ServiceStatus =
  | 'pending'
  | 'scheduled'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'cancelled'
  | 'terminated';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  packageId?: string;
  tier: TierId;
  cpu: number;
  ram: number;
  storage: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string | null;
  name: string;
  whatsapp: string;
  email: string;
  serverName: string;
  note?: string;
  tier: TierId;
  packageId?: string;
  cpu: number;
  ram: number;
  storage: number;
  subtotal: number;
  couponCode?: string;
  discount: number;
  total: number;
  status: OrderStatus;
  currency: 'IDR';
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  expiresAt?: string;
  maxUsage?: number;
  maxUsagePerCustomer?: number;
  active: boolean;
  applicableTiers?: TierId[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  orderId: string;
  email?: string;
  discount: number;
  createdAt: string;
}

export interface SavedConfiguration {
  id: string;
  userId?: string;
  guestId?: string;
  tier: TierId;
  cpu: number;
  ram: number;
  storage: number;
  packageId?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
}

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Ticket {
  id: string;
  customerId: string | null;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  channel: 'dashboard' | 'email' | 'whatsapp';
  channelConfigured: boolean;
}

export type AuditAction =
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'create'
  | 'update'
  | 'delete'
  | 'pricing_change'
  | 'coupon_change'
  | 'order_modification'
  | 'customer_modification'
  | 'cms_change'
  | 'legal_change'
  | 'role_change'
  | 'maintenance_change'
  | 'service_lifecycle'
  | 'renewal'
  | 'reminder'
  | 'vps_change';

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorRole?: Role | null;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  author: string;
  publishedAt?: string;
  status: 'draft' | 'published';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating?: number;
  published: boolean;
}

export interface PageDoc {
  id: string;
  key: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}

export interface LegalDocument {
  id: string;
  slug: string;
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  message: string;
  startedAt: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  message: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  serviceType: 'server_builder' | 'vps_package';
  status: 'active' | 'inactive';
  visibility: 'public' | 'hidden';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  productId: string;
  tier: TierId;
  cpu: number;
  ram: number;
  storage: number;
  price: number;
  orderable: boolean;
  metadata?: Record<string, unknown>;
}

export interface VpsLocation {
  id: string;
  name: string;
  country: string;
  city: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type VpsStatus = 'available' | 'sold_out' | 'maintenance' | 'inactive';
export type BillingPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export interface VpsPackage {
  id: string;
  name: string;
  slug: string;
  cpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
  locationId: string;
  price: number;
  billingPeriod: BillingPeriod;
  renewable: boolean;
  status: VpsStatus;
  visibility: 'public' | 'hidden';
  ipv4: boolean;
  virtualization?: string;
  description: string;
  features: string[];
  serviceDays: number;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInstance {
  id: string;
  customerId: string;
  orderId: string;
  productId: string;
  packageId?: string;
  serviceType: 'server_builder' | 'vps_package';
  status: ServiceStatus;
  activationAt: string;
  expiresAt: string;
  renewable: boolean;
  price: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type RenewalStatus = 'pending' | 'paid' | 'completed' | 'cancelled' | 'expired';

export interface ServiceRenewal {
  id: string;
  serviceId: string;
  orderId: string;
  duration: number;
  oldExpiresAt: string;
  newExpiresAt: string;
  price: number;
  status: RenewalStatus;
  createdAt: string;
  completedAt?: string;
}

export type ReminderType = 'expiring_7d' | 'expiring_3d' | 'expiring_1d' | 'expired';
export type ReminderStatus = 'scheduled' | 'sent' | 'skipped' | 'failed';

export interface ServiceReminder {
  id: string;
  serviceId: string;
  customerId: string;
  reminderType: ReminderType;
  scheduledAt: string;
  sentAt?: string;
  status: ReminderStatus;
  channel: 'dashboard' | 'email' | 'whatsapp';
  channelConfigured: boolean;
  createdAt: string;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  errors?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
