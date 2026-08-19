# Arsitektur WangStore

## Prinsip

1. **Satu sumber kebenaran.** PostgreSQL (Supabase) adalah source of truth production. Server/database time adalah sumber kebenaran untuk lifecycle, aktivasi, kedaluwarsa, dan reminder. Shared server-side modules adalah sumber kebenaran untuk pricing, validasi, otorisasi, transisi lifecycle, dan business rules.
2. **Browser hanya untuk input.** localStorage/client state/query string tidak pernah menjadi sumber kebenaran harga, expires_at, role, atau status.
3. **Serverless-compatible.** Tidak ada daemon, while-loop, cron lokal, PM2, systemd, atau persistent in-memory state sebagai database.
4. **DRY.** Satu pricing engine, satu RBAC, satu notification system, satu audit system, satu generic CMS handler.

## Domain Model

- **Product** — layanan yang dijual (`server_builder`, `vps_package`).
- **Package** — paket tetap (mis. High tier) atau paket VPS.
- **Order** — transaksi (satu sumber transaksi).
- **Service Instance** — representasi layanan setelah order memenuhi syarat pembuatan layanan.
- **Renewal** — transaksi/order yang dapat diaudit; lifecycle diperbarui hanya setelah kondisi pembayaran/konfirmasi terpenuhi.

Status order dan status layanan adalah **domain berbeda**:

```
order:    pending / awaiting_payment / paid / processing / completed / cancelled / expired / refunded
service:  pending / scheduled / active / suspended / expired / cancelled / terminated
```

## Layer

```
┌─────────────────────────────────────────────────────┐
│ UI (Server Components + minimal client)              │
├─────────────────────────────────────────────────────┤
│ API Routes (/api/...)                                │
│   → runRequestGuard (payload, auth, CSRF, rate)      │
│   → Zod → sanitize → normalize → authorize           │
│   → business validation → server-side pricing        │
│   → transaction → audit                              │
├─────────────────────────────────────────────────────┤
│ Shared Business Modules                              │
│   pricing/   services.ts   coupons.ts   rbac.ts      │
│   auth/verification.ts   email.ts   whatsapp.ts      │
│   cms/resources.ts                                   │
├─────────────────────────────────────────────────────┤
│ DataStore abstraction (lib/db)                       │
│   → Supabase (production)                            │
│   → JSON fallback (local dev only)                   │
└─────────────────────────────────────────────────────┘
```

## Pricing Engine

`src/lib/pricing/` adalah satu modul yang diimpor oleh UI dan API.

- **Tier Low** — konfigurasi custom. Bounds: CPU 2–16 (step 1), RAM 4–32 (step 2), Storage 20–160 (step 10). Storage >160 **ditolak** dan dinormalisasi ke 160.
- **Formula Low**: `base(5000) + CPU*7000 + RAM*4500 + Storage*300`, dibulatkan ke Rp500, minimum Rp45.000.
- **Tier High** — paket tetap, harga final, tanpa multiplier.
- **Tier Medium** — status `ongoing`, tidak dapat dipesan (API menolak dengan 409). Admin dapat mengubah status via `api/admin/pricing`.

`resolveServerQuote()` (di `src/lib/pricing/server-quote.ts`) adalah resolver server-authoritative yang membaca aturan dari database (`pricing_rules`) dan **selalu menghitung ulang harga**; harga dari client diabaikan.

## Service Lifecycle

`src/lib/services.ts` adalah satu sumber kebenaran lifecycle:

- `resolveServiceStatus()` — menentukan status efektif (scheduled/active/expired/dll) berdasarkan **server time**.
- `createServiceWindow()` — activation_at + duration → expires_at.
- `computeRenewalWindow()` — layanan active diperpanjang dari expires_at saat ini; layanan expired dimulai dari server now.
- `canRenew()` — hanya jika renewable dan belum terminated/cancelled.
- Reminder: default 7/3/1 hari sebelum expired + saat expired. Idempotent (unique constraint `(service_id, reminder_type)`).

## RBAC

`src/lib/auth/rbac.ts` mendefinisikan permission matrix eksplisit. Owner > Admin > Staff hanya hierarchy; otorisasi berbasis permission. Setiap route admin memanggil `requirePermissionResponse()`.

## CMS

`src/lib/cms/resources.ts` memetakan satu generic handler ke banyak resource (pages, faq, testimonials, blog, knowledgeBase, legal, announcements, incidents, maintenance). Setiap resource memiliki: collection, identity field, allowed fields (whitelist), validation schema, dan minimum permission. Domain sensitif (order, payment, auth, service lifecycle) **tidak** lewat generic CRUD.

## Keamanan

Lihat `docs/SECURITY.md`.

## Datastore

- `getDatastore()` memilih Supabase jika dikonfigurasi atau jika berjalan di Vercel; jika tidak, JSON fallback lokal.
- JSON fallback **gagal eksplisit** di production/preview (menggunakan `VERCEL` env check).

## Verifikasi

- `npm run typecheck`, `npm run lint`, `npm run build` bersih.
- `npm test` → 34 tes (pricing + business).
- `npm run smoke` → HTTP smoke test (public pages, pricing API, order flow, CSRF, redirect).
