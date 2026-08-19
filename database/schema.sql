-- =====================================================================
-- WangStore — PostgreSQL schema (Supabase)
-- Jalankan seluruh file ini pada Supabase SQL Editor.
-- Setiap foreign key, unique constraint, index, check constraint, dan
-- policy memiliki alasan bisnis atau integritas data.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Core auth & RBAC
-- ---------------------------------------------------------------------

create table if not exists roles (
  id text primary key,
  name text not null,
  key text not null unique
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'customer' references roles(id),
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on users (lower(email));

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade unique,
  whatsapp text,
  discord text,
  phone text,
  company text,
  bio text,
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Email verification — upgrade path for existing deployments
-- (idempotent; aman dijalankan ulang. Tidak menghapus data apa pun.)
-- ---------------------------------------------------------------------

-- Kolom timestamp verifikasi untuk skema lama yang belum memilikinya.
alter table users add column if not exists email_verified_at timestamptz;
alter table profiles add column if not exists email_verified_at timestamptz;

-- Akselerasi lookup token (hash sudah unique → indeks otomatis).
create index if not exists idx_verification_tokens_user on verification_tokens (user_id);
create index if not exists idx_password_reset_tokens_user on password_reset_tokens (user_id);

-- Backfill AMAN untuk akun lama:
--  - Role internal (owner/admin/staff) dianggap terverifikasi (operator
--    terpercaya) sehingga akses admin tidak terputus.
--  - Customer lama TIDAK di-backfill: mereka wajib memverifikasi email saat
--    login berikutnya (fitur kirim ulang tersedia). Data akun tidak diubah.
update users
   set email_verified = true,
       email_verified_at = coalesce(email_verified_at, updated_at)
 where role in ('owner','admin','staff')
   and email_verified = false;

update profiles p
   set email_verified = true,
       email_verified_at = coalesce(p.email_verified_at, p.updated_at)
  from users u
 where u.id = p.user_id
   and u.role in ('owner','admin','staff')
   and p.email_verified = false;

-- Token verifikasi kedaluwarsa/terpakai tidak pernah dipakai lagi; baris
-- lama boleh dibersihkan agar tabel tetap ramping.
delete from verification_tokens where expires_at < now() - interval '7 days';
delete from password_reset_tokens where expires_at < now() - interval '7 days';

-- ---------------------------------------------------------------------
-- Catalog: products, packages, pricing
-- ---------------------------------------------------------------------

create table if not exists products (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  service_type text not null check (service_type in ('server_builder','vps_package')),
  status text not null default 'active' check (status in ('active','inactive')),
  visibility text not null default 'public' check (visibility in ('public','hidden')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists packages (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  tier text not null check (tier in ('low','medium','high')),
  cpu integer not null,
  ram integer not null,
  storage integer not null,
  price integer not null check (price >= 0),
  orderable boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_packages_tier on packages (tier);

create table if not exists pricing_rules (
  id text primary key,
  tier text not null unique,
  type text not null check (type in ('custom','package')),
  status text not null default 'available' check (status in ('available','ongoing','maintenance')),
  active boolean not null default true,
  base integer,
  per_core integer,
  per_gb_ram integer,
  per_gb_storage integer,
  round_to integer,
  min_price integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- VPS catalog
-- ---------------------------------------------------------------------

create table if not exists vps_locations (
  id text primary key,
  name text not null,
  country text not null,
  city text not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vps_packages (
  id text primary key,
  name text not null,
  slug text not null unique,
  cpu integer not null check (cpu between 1 and 128),
  ram integer not null check (ram between 1 and 1024),
  storage integer not null check (storage >= 10),
  bandwidth integer not null default 0,
  location_id text references vps_locations(id),
  price integer not null check (price >= 0),
  billing_period text not null default 'monthly' check (billing_period in ('monthly','quarterly','semi_annual','annual')),
  renewable boolean not null default true,
  status text not null default 'available' check (status in ('available','sold_out','maintenance','inactive')),
  visibility text not null default 'public' check (visibility in ('public','hidden')),
  ipv4 boolean not null default true,
  virtualization text,
  description text,
  features jsonb not null default '[]',
  service_days integer not null default 30 check (service_days between 1 and 730),
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Orders, coupons
-- ---------------------------------------------------------------------

create table if not exists coupons (
  id text primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value integer not null,
  min_order integer,
  expires_at timestamptz,
  max_usage integer,
  max_usage_per_customer integer,
  active boolean not null default true,
  applicable_tiers jsonb,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  customer_id uuid references users(id) on delete set null,
  name text not null,
  whatsapp text not null,
  email text not null,
  server_name text not null,
  note text,
  tier text not null check (tier in ('low','medium','high')),
  package_id text,
  cpu integer not null,
  ram integer not null,
  storage integer not null,
  subtotal integer not null check (subtotal >= 0),
  coupon_code text,
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total > 0),
  status text not null default 'pending' check (status in ('pending','awaiting_payment','paid','processing','completed','cancelled','expired','refunded')),
  currency text not null default 'IDR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_customer on orders (customer_id);
create index if not exists idx_orders_status on orders (status);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id),
  package_id text,
  tier text not null,
  cpu integer not null,
  ram integer not null,
  storage integer not null,
  price integer not null check (price >= 0)
);

create table if not exists coupon_usages (
  id text primary key,
  coupon_id text not null references coupons(id) on delete cascade,
  order_id text not null references orders(id) on delete cascade,
  email text,
  discount integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_coupon_usages_coupon on coupon_usages (coupon_id);

-- ---------------------------------------------------------------------
-- Services lifecycle
-- ---------------------------------------------------------------------

create table if not exists service_instances (
  id text primary key,
  customer_id uuid not null references users(id) on delete cascade,
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id),
  package_id text,
  service_type text not null check (service_type in ('server_builder','vps_package')),
  status text not null default 'pending' check (status in ('pending','scheduled','active','suspended','expired','cancelled','terminated')),
  activation_at timestamptz not null,
  expires_at timestamptz not null,
  renewable boolean not null default true,
  price integer not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_expiry_after_activation check (expires_at > activation_at)
);

create index if not exists idx_service_customer on service_instances (customer_id);
create index if not exists idx_service_expires on service_instances (expires_at);

create table if not exists service_renewals (
  id text primary key,
  service_id text not null references service_instances(id) on delete cascade,
  order_id text not null references orders(id) on delete cascade,
  duration integer not null check (duration between 1 and 730),
  old_expires_at timestamptz not null,
  new_expires_at timestamptz not null,
  price integer not null check (price >= 0),
  status text not null default 'pending' check (status in ('pending','paid','completed','cancelled','expired')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists service_reminders (
  id text primary key,
  service_id text not null references service_instances(id) on delete cascade,
  customer_id uuid not null references users(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('expiring_7d','expiring_3d','expiring_1d','expired')),
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','sent','skipped','failed')),
  channel text not null default 'dashboard',
  channel_configured boolean not null default false,
  created_at timestamptz not null default now(),
  -- Mencegah pengiriman duplikat untuk event yang sama (idempotency).
  constraint uq_service_reminder unique (service_id, reminder_type)
);

-- ---------------------------------------------------------------------
-- Saved configurations
-- ---------------------------------------------------------------------

create table if not exists saved_configurations (
  id text primary key,
  user_id uuid references users(id) on delete cascade,
  guest_id text,
  name text not null,
  tier text not null,
  cpu integer not null,
  ram integer not null,
  storage integer not null,
  package_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tickets
-- ---------------------------------------------------------------------

create table if not exists tickets (
  id text primary key,
  customer_id uuid references users(id) on delete set null,
  subject text not null,
  body text not null,
  status text not null default 'open' check (status in ('open','pending','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ticket_messages (
  id text primary key,
  ticket_id text not null references tickets(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------

create table if not exists notifications (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  channel text not null default 'dashboard',
  channel_configured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications (user_id);

-- ---------------------------------------------------------------------
-- CMS
-- ---------------------------------------------------------------------

create table if not exists blog_categories (
  id text primary key,
  name text not null,
  slug text not null unique
);

create table if not exists blog_posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  category_id text references blog_categories(id),
  tags jsonb not null default '[]',
  author text not null default 'Tim WangStore',
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_tags (
  id text primary key,
  name text not null unique
);

create table if not exists knowledge_articles (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  category text not null,
  tags jsonb not null default '[]',
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists faq_items (
  id text primary key,
  question text not null,
  answer text not null,
  category text not null default 'Umum',
  sort_order integer not null default 0,
  published boolean not null default true
);

create table if not exists testimonials (
  id text primary key,
  name text not null,
  role text,
  content text not null,
  rating integer check (rating between 1 and 5),
  published boolean not null default true
);

create table if not exists pages (
  id text primary key,
  key text not null unique,
  title text not null,
  slug text not null,
  content text not null,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

create table if not exists legal_documents (
  id text primary key,
  slug text not null unique,
  title text not null,
  content text not null,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

create table if not exists announcements (
  id text primary key,
  title text not null,
  body text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists incidents (
  id text primary key,
  title text not null,
  status text not null default 'investigating' check (status in ('investigating','identified','monitoring','resolved')),
  severity text not null default 'minor' check (severity in ('minor','major','critical')),
  message text,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists maintenance_windows (
  id text primary key,
  title text not null,
  message text,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','in_progress','completed','cancelled')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Settings & audit
-- ---------------------------------------------------------------------

create table if not exists site_settings (
  id text primary key,
  site_name text,
  tagline text,
  whatsapp text,
  discord text,
  email text,
  twitter text,
  instagram text,
  github text,
  maintenance_mode boolean not null default false,
  maintenance_title text,
  maintenance_message text,
  maintenance_eta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id text primary key,
  actor_id uuid references users(id) on delete set null,
  actor_role text,
  action text not null,
  resource text not null,
  resource_id text,
  ip text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_created on audit_logs (created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table users enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table service_instances enable row level security;
alter table service_renewals enable row level security;
alter table service_reminders enable row level security;
alter table notifications enable row level security;
alter table tickets enable row level security;
alter table ticket_messages enable row level security;
alter table saved_configurations enable row level security;
alter table audit_logs enable row level security;

-- Customer dapat mengakses hanya data miliknya sendiri.
create policy "users_own" on users
  for select using (auth.uid() = id);
create policy "profiles_own" on profiles
  for select using (auth.uid() = user_id);
create policy "orders_own" on orders
  for select using (auth.uid() = customer_id);
create policy "order_items_via_order" on order_items
  for select using (exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "services_own" on service_instances
  for select using (auth.uid() = customer_id);
create policy "renewals_own" on service_renewals
  for select using (exists (select 1 from service_instances s where s.id = service_id and s.customer_id = auth.uid()));
create policy "reminders_own" on service_reminders
  for select using (auth.uid() = customer_id);
create policy "notifications_own" on notifications
  for select using (auth.uid() = user_id);
create policy "tickets_own" on tickets
  for select using (auth.uid() = customer_id);
create policy "ticket_messages_own" on ticket_messages
  for select using (exists (select 1 from tickets t where t.id = ticket_id and t.customer_id = auth.uid()));
create policy "saved_configs_own" on saved_configurations
  for all using (auth.uid() = user_id);

-- Audit log hanya dibaca role yang berwenang (service role / admin).
create policy "audit_service_role" on audit_logs
  for select using (auth.jwt() ->> 'role' = 'service_role');

-- Operator/staff mengakses data pelanggan melalui service role key (server-side),
-- bukan melalui anon/authenticated RLS langsung. Ini menjaga least-privilege.
