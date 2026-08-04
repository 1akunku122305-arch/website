-- ---------------------------------------------------------------------------
-- WangStore — PostgreSQL schema
--
-- The application ships with a file-backed JSON datastore so it runs with zero
-- external services. This schema mirrors that exact shape for deployments that
-- use the containerised stack (docker/docker-compose.yml) and is applied
-- automatically on first boot of the postgres container.
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

DO $$ BEGIN
    CREATE TYPE user_role     AS ENUM ('OWNER', 'ADMIN', 'STAFF');
    CREATE TYPE order_status  AS ENUM ('NEW', 'CONTACTED', 'PAID', 'ACTIVE', 'CANCELLED');
    CREATE TYPE ticket_status AS ENUM ('OPEN', 'ANSWERED', 'CLOSED');
    CREATE TYPE coupon_type   AS ENUM ('PERCENT', 'FIXED');
    CREATE TYPE node_status   AS ENUM ('OPERATIONAL', 'DEGRADED', 'MAINTENANCE', 'DOWN');
    CREATE TYPE severity      AS ENUM ('MINOR', 'MAJOR', 'CRITICAL', 'MAINTENANCE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         CITEXT UNIQUE,
    name          TEXT        NOT NULL,
    role          user_role   NOT NULL DEFAULT 'STAFF',
    password_hash TEXT        NOT NULL,
    email_verified_at TIMESTAMPTZ,
    totp_secret   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS regions (
    id               TEXT PRIMARY KEY,
    name             TEXT    NOT NULL,
    flag             TEXT    NOT NULL DEFAULT '',
    city             TEXT    NOT NULL DEFAULT '',
    latency_ms       INTEGER NOT NULL DEFAULT 0,
    price_multiplier NUMERIC(6,3) NOT NULL DEFAULT 1.0,
    enabled          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS price_formula (
    id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    currency   TEXT NOT NULL DEFAULT 'IDR',
    components JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
    code        TEXT PRIMARY KEY,
    type        coupon_type NOT NULL,
    value       NUMERIC(12,2) NOT NULL CHECK (value >= 0),
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    max_uses    INTEGER     NOT NULL DEFAULT 0,
    uses        INTEGER     NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ,
    description TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id                TEXT PRIMARY KEY,
    status            order_status NOT NULL DEFAULT 'NEW',
    customer_name     TEXT NOT NULL,
    customer_email    TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    server_name       TEXT NOT NULL,
    notes             TEXT NOT NULL DEFAULT '',
    coupon_code       TEXT REFERENCES coupons(code) ON DELETE SET NULL,
    config            JSONB NOT NULL,
    subtotal          BIGINT NOT NULL DEFAULT 0,
    discount          BIGINT NOT NULL DEFAULT 0,
    total             BIGINT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_email_idx   ON orders (lower(customer_email));
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON orders (status);

CREATE TABLE IF NOT EXISTS tickets (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT NOT NULL,
    message    TEXT NOT NULL,
    status     ticket_status NOT NULL DEFAULT 'OPEN',
    replies    JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tickets_email_idx ON tickets (lower(email));

CREATE TABLE IF NOT EXISTS posts (
    slug         TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    excerpt      TEXT NOT NULL DEFAULT '',
    body         TEXT NOT NULL,
    category     TEXT NOT NULL DEFAULT 'Umum',
    tags         TEXT[] NOT NULL DEFAULT '{}',
    author       TEXT NOT NULL DEFAULT 'WangStore',
    cover        TEXT,
    published    BOOLEAN NOT NULL DEFAULT FALSE,
    published_at DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, published_at DESC);

CREATE TABLE IF NOT EXISTS articles (
    slug       TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    category   TEXT NOT NULL DEFAULT 'Umum',
    body       TEXT NOT NULL,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS faqs (
    id       TEXT PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'Umum',
    question TEXT NOT NULL,
    answer   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    region      TEXT NOT NULL,
    status      node_status NOT NULL DEFAULT 'OPERATIONAL',
    uptime_30d  NUMERIC(5,2) NOT NULL DEFAULT 100,
    cpu         TEXT NOT NULL DEFAULT '',
    ram         TEXT NOT NULL DEFAULT '',
    storage     TEXT NOT NULL DEFAULT '',
    network     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS incidents (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    severity    severity NOT NULL DEFAULT 'MINOR',
    affected    TEXT[] NOT NULL DEFAULT '{}',
    updates     JSONB  NOT NULL DEFAULT '[]'::jsonb,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS announcements (
    id     TEXT PRIMARY KEY,
    body   TEXT NOT NULL,
    level  TEXT NOT NULL DEFAULT 'INFO',
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS testimonials (
    name   TEXT PRIMARY KEY,
    role   TEXT NOT NULL DEFAULT '',
    body   TEXT NOT NULL,
    rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS settings (
    id      SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id     TEXT PRIMARY KEY,
    at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor  TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS audit_at_idx ON audit_logs (at DESC);

CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
