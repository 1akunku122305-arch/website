export type Role = "OWNER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
  flag: string;
  city: string;
  latencyMs: number;
  priceMultiplier: number;
  enabled: boolean;
}

export interface PriceFormula {
  currency: string;
  base: number;
  perCore: number;
  perGbRam: number;
  perGbSsd: number;
  perGbNvme: number;
  perGbHdd: number;
  perTbBandwidth: number;
  dedicatedIp: number;
  perExtraPort: number;
  backup: number;
  prioritySupport: number;
  ddosAdvanced: number;
  panelPterodactyl: number;
  panelReviactyl: number;
}

export interface Coupon {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  active: boolean;
  maxUses: number;
  uses: number;
  expiresAt: string | null;
  description: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "NEW" | "CONTACTED" | "PAID" | "ACTIVE" | "CANCELLED";
  customer: { name: string; whatsapp: string; email: string };
  serverName: string;
  notes: string;
  coupon: string | null;
  config: Record<string, string | number | boolean>;
  total: number;
  subtotal: number;
  discount: number;
}

export interface Ticket {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  replies: { at: string; author: string; body: string }[];
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  cover: string | null;
  published: boolean;
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  body: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Node {
  id: string;
  name: string;
  region: string;
  status: "OPERATIONAL" | "DEGRADED" | "MAINTENANCE" | "DOWN";
  uptime30d: number;
  cpu: string;
  ram: string;
  storage: string;
  network: string;
}

export interface Incident {
  id: string;
  title: string;
  startedAt: string;
  resolvedAt: string | null;
  severity: "MINOR" | "MAJOR" | "CRITICAL" | "MAINTENANCE";
  affected: string[];
  updates: { at: string; body: string }[];
}

export interface Announcement {
  id: string;
  body: string;
  level: "INFO" | "WARN" | "SUCCESS";
  active: boolean;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
}

export interface Settings {
  siteTitle: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  mascot: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  footerText: string;
  maintenance: boolean;
  maintenanceMessage: string;
  theme: { brand: string; brand2: string; brand3: string; accent: string };
  contact: { email: string; phone: string; address: string; hours: string };
  social: {
    whatsapp: string;
    whatsappGroup: string;
    discord: string;
    telegram: string;
    tiktok: string;
    github: string;
    instagram: string;
  };
  legal: Record<string, { title: string; updatedAt: string; body: string }>;
  about: {
    story: string;
    vision: string;
    mission: string[];
    team: { name: string; role: string; bio: string }[];
    tech: string[];
  };
}

export interface Database {
  users: User[];
  settings: Settings;
  regions: Region[];
  priceFormula: PriceFormula;
  coupons: Coupon[];
  orders: Order[];
  tickets: Ticket[];
  posts: Post[];
  articles: Article[];
  faqs: Faq[];
  nodes: Node[];
  incidents: Incident[];
  announcements: Announcement[];
  audit: AuditLog[];
  testimonials: { name: string; role: string; body: string; rating: number }[];
}
