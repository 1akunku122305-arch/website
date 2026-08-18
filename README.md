# WangStore — Build Your Own Server.

WangStore adalah **platform e-commerce / SaaS** untuk menjual layanan hosting dan mengelola pelanggan. Aplikasi ini **bukan** infrastructure hosting dan **bukan** control panel Minecraft — ia hanya menangani katalog layanan, Server Builder, kalkulasi harga, akun pelanggan, pemesanan, order management, customer portal, kupon, tiket, WhatsApp, admin panel, CMS, blog, knowledge base, FAQ, status layanan, legal pages, analitik, dan audit log.

Deployment target: **Cloudflare/Vercel (serverless) + Supabase (PostgreSQL)**. Tidak bergantung pada VPS, Docker, Nginx, PM2, systemd, atau PostgreSQL lokal.

---

## Fitur Utama

- **Server Builder** — pilih Tier (Low/Medium/High), konfigurasi custom (Low) atau paket tetap (High), harga real-time, dan estimasi performa.
- **Pricing engine shared** — satu modul harga (`src/lib/pricing/`) dipakai UI dan API. Harga dihitung **server-side**, harga dari browser diabaikan.
- **Order flow** — POST `/api/orders`, validasi, verifikasi tier, kupon, kalkulasi server-side, WhatsApp redirect, konfirmasi order.
- **VPS Package Store** — katalog VPS dari database, dikelola admin.
- **Service Lifecycle** — aktivasi, kedaluwarsa, perpanjangan, dan reminder memakai **server time**.
- **Auth & RBAC** — register, login, logout, forgot/reset password, email verification, profil; role Owner > Admin > Staff + permission matrix.
- **CMS generik** — seluruh konten (pages, FAQ, testimoni, blog, knowledge base, legal, insiden, maintenance, pengumuman) diedit dari dashboard.
- **Keamanan** — JWT session, bcrypt, CSRF double-submit, rate limiting, audit log, security headers, sanitization, RLS.

---

## Tech Stack

- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS
- Zod (validasi), jose (JWT), bcryptjs
- Supabase (PostgreSQL) untuk production
- JSON datastore lokal untuk development fallback
- lucide-react, marked (Markdown)

---

## Arsitektur

```
src/
  app/            # Routes (App Router)
  components/     # UI components + reusable component system
  lib/
    auth/         # password, session (JWT), rbac, tokens
    db/           # DataStore abstraction (Supabase / JSON fallback)
    pricing/      # Pricing engine (single source of truth)
    security/     # csrf, rate-limit, sanitize
    cms/          # generic CMS resource map + pages
    validation/   # Zod schemas
    whatsapp/     # WhatsApp integration
    services.ts   # service lifecycle engine
    coupons.ts    # coupon engine
database/
  schema.sql      # PostgreSQL/Supabase schema (jalankan di SQL Editor)
docs/
  ARCHITECTURE.md
  DEPLOYMENT.md
  SECURITY.md
  API.md
scripts/
  seed.ts
  smoke-test.ts
tests/            # pricing + business rule tests
```

Lihat `docs/ARCHITECTURE.md` untuk detail.

---

## Local Development

Prasyarat: Node.js 18+ dan npm.

```bash
git clone <repository>
cd wangstore
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Jika Supabase belum dikonfigurasi, aplikasi otomatis memakai **JSON datastore lokal** (`data/*.json`) — hanya untuk pengembangan lokal, bukan production. Untuk membuat akun owner (admin) lokal, atur di `.env.local`:

```
WANGSTORE_ADMIN_EMAIL=admin@example.com
WANGSTORE_ADMIN_PASSWORD=rahasia123
```

Kemudian login sebagai owner melalui halaman `/login`.

> Catatan: JSON fallback **dilarang aktif di production/preview**. Saat berjalan di Vercel tanpa Supabase, aplikasi akan gagal secara eksplisit dengan error konfigurasi.

---

## Supabase Setup

1. Buat project di [Supabase](https://supabase.com).
2. Buka **SQL Editor** dan jalankan seluruh isi `database/schema.sql`.
3. (Opsional) aktifkan Row Level Security sesuai yang sudah didefinisikan di schema.
4. Konfigurasi **Authentication** → Site URL dan Redirect URLs ke URL production Anda.
5. Isi environment variables (lihat `docs/DEPLOYMENT.md`).

---

## Environment Variables

Semua variabel dijelaskan di `.env.example`. Yang wajib:

| Variabel | Keterangan |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL aplikasi |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-only, jangan ke browser** |
| `JWT_SECRET` | Secret acak panjang (≥32 karakter) |
| `WHATSAPP_NUMBER` | Nomor WhatsApp tujuan (format internasional) |

Jangan pernah meng-commit `.env` / `.env.local` / service role key / JWT secret.

---

## Deployment (Vercel)

Lihat panduan lengkap di `docs/DEPLOYMENT.md`. Ringkasannya:

1. Push repository ke GitHub.
2. Import repository di Vercel (deteksi otomatis Next.js).
3. Tambahkan environment variables production.
4. `Deploy`.
5. Verifikasi dengan daftar periksa di `docs/DEPLOYMENT.md`.

---

## Scripts

```bash
npm run dev          # development
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # vitest (pricing + business)
npm run smoke        # HTTP smoke test (perlu server berjalan)
```

---

## Keamanan

- Semua route admin memverifikasi RBAC server-side.
- Harga, kupon, aktivasi, kedaluwarsa, dan status layanan tidak pernah dipercaya dari browser.
- Audit log mencatat tindakan sensitif tanpa menyimpan password/secret.
- Lihat `docs/SECURITY.md`.

---

## API

Ringkasan endpoint ada di `docs/API.md`. Semua respons memakai format:

```json
{ "success": true, "data": {} }
{ "success": false, "code": "...", "message": "..." }
```

---

## Testing

`npm test` menjalankan 34 tes: harga High, Low minimum, normalisasi overflow, Medium→409, paket palsu→422, estimasi, lifecycle layanan (scheduled/active/expired), renewal, kupon, dan reminder. `npm run smoke` memverifikasi HTTP endpoint terhadap server yang berjalan.

---

## Troubleshooting

- **Build gagal** → jalankan `npm run build`, pastikan tidak ada error TypeScript/ESLint.
- **Supabase connection gagal** → periksa `NEXT_PUBLIC_SUPABASE_URL` dan key.
- **Authentication gagal** → cek Supabase Site URL / Redirect URLs.
- **API lokal OK tapi gagal di Vercel** → pastikan tidak memakai filesystem/persistent memory (gunakan datastore Supabase).

Lihat `docs/DEPLOYMENT.md` untuk troubleshooting lebih lanjut.

---

## Lisensi

MIT — lihat `LICENSE`.
