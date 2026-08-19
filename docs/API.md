# API WangStore

Semua endpoint mengembalikan format konsisten:

```json
{ "success": true, "data": { } }
{ "success": false, "code": "...", "message": "..." }
```

`code` contoh: `validation_error`, `unauthorized`, `forbidden`, `email_not_verified`, `csrf_denied`, `rate_limited`, `cooldown`, `invalid_coupon`, `invalid_package`, `tier_ongoing`, `not_found`, `invalid_transition`.

State-changing requests memerlukan header `x-csrf-token` (dari `/api/csrf`) dan cookie CSRF (double-submit).

---

## Auth

| Method | Route | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Daftar (rate limited). Akun dibuat `email_verified=false`; token verifikasi dikirim |
| POST | `/api/auth/login` | Login (rate limited, timing-resistant). Akun belum terverifikasi → `requiresVerification: true` |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Data user saat ini |
| POST | `/api/auth/verify-email` | Verifikasi email, body `{ token }` → JSON `{ status }` |
| GET | `/api/auth/verify-email?token=` | Verifikasi via link langsung (legacy, redirect ke halaman status) |
| POST | `/api/auth/resend-verification` | Kirim ulang email verifikasi (cooldown 60s, rate limit per-IP & per-user) |
| POST | `/api/auth/forgot-password` | Kirim tautan reset (rate limited, anti-enumerasi) |
| POST | `/api/auth/reset-password` | Reset kata sandi (rate limited, token sekali pakai) |

### Status verifikasi email

`POST /api/auth/verify-email` dan halaman `/verify-email` mengenali status:

| Status | Arti |
|---|---|
| `success` | ✅ Token valid, akun diaktifkan (`email_verified=true`, `email_verified_at` diisi) |
| `already_verified` | ✅ Email sudah terverifikasi sebelumnya (token dikonsumsi) |
| `expired` | ❌ Token melewati batas waktu (default 60 menit) |
| `invalid` | ❌ Token tidak dikenal / sudah digunakan |

Endpoint terproteksi mengembalikan `403 email_not_verified` bila session belum terverifikasi.

## Account (autentikasi)

| Method | Route | Keterangan |
|---|---|---|
| GET/PATCH | `/api/account/profile` | Baca/ubah profil |
| POST | `/api/account/change-password` | Ubah kata sandi |
| GET/POST | `/api/account/saved-configs` | Konfigurasi tersimpan |
| DELETE | `/api/account/saved-configs/[id]` | Hapus konfigurasi |
| GET/PATCH | `/api/account/notifications` | Notifikasi |

## Catalog & Pricing

| Method | Route | Keterangan |
|---|---|---|
| GET | `/api/products` | Produk publik |
| GET | `/api/packages` | Paket publik |
| POST | `/api/pricing` | Hitung harga (server-side, shared engine) |
| POST | `/api/coupons/validate` | Validasi kupon (server-side) |

## Orders

| Method | Route | Keterangan |
|---|---|---|
| GET | `/api/orders` | Order milik customer |
| POST | `/api/orders` | Buat order (server-side pricing; client price ignored) |
| GET | `/api/orders/[id]` | Detail order (owner/staff) |

Harga dari client **diabaikan sepenuhnya**. Server memakai `resolveServerQuote()`.

### Urutan POST /api/orders

```
request → Zod → verify tier → reject ongoing (409) → verify package (422)
→ verify coupon (server-side) → calculate price server-side → create order
→ audit → WhatsApp URL → response
```

Medium → `409 tier_ongoing`. High tanpa paket valid / paket palsu → `422`. Unknown tier → `422`. Tidak pernah menghasilkan total Rp0.

## Services (autentikasi)

| Method | Route | Keterangan |
|---|---|---|
| GET | `/api/services` | Layanan customer (status efektif server-side) |
| GET | `/api/services/[id]` | Detail layanan |
| POST | `/api/services/[id]/renew` | Renewal (server-side validation & pricing) |
| GET | `/api/services/[id]/reminders` | Reminder layanan |

## VPS (publik)

| Method | Route | Keterangan |
|---|---|---|
| GET | `/api/vps` | Paket VPS publik |
| GET | `/api/vps/[id]` | Detail paket VPS |

## Tickets

| Method | Route | Keterangan |
|---|---|---|
| GET/POST | `/api/tickets` | Daftar / buat tiket |
| GET | `/api/tickets/[id]` | Detail tiket + pesan |
| POST | `/api/tickets/[id]/messages` | Balas tiket |

## Contact

| Method | Route | Keterangan |
|---|---|---|
| POST | `/api/contact` | Kirim pesan kontak → dibuat sebagai tiket |

## Admin (RBAC wajib)

| Method | Route | Permission |
|---|---|---|
| GET | `/api/admin/orders` | `orders:read` |
| GET/PATCH | `/api/admin/orders/[id]` | `orders:read` / `orders:write` |
| GET | `/api/admin/customers` | `customers:read` |
| GET/POST/PATCH/DELETE | `/api/admin/coupons` & `[id]` | `coupons:read` / `coupons:write` |
| GET/PATCH | `/api/admin/pricing` | `pricing:read` / `pricing:write` |
| GET/POST/PATCH/DELETE | `/api/admin/vps` & `[id]` | `vps:read` / `vps:write` |
| GET | `/api/admin/services` | `services:read` |
| GET/PATCH | `/api/admin/services/[id]` | `services:read` / `services:lifecycle` |
| GET | `/api/admin/service-status` | `services:read` |
| GET/PATCH | `/api/admin/settings` | `settings:write` |
| GET | `/api/admin/audit-logs` | `audit:read` |
| GET | `/api/admin/analytics` | `analytics:read` |
| GET/PATCH | `/api/admin/users` | `users:read` / `roles:manage` (owner) |

### Generic CMS

`/api/admin/cms/[resource]` dan `/api/admin/cms/[resource]/[id]` (GET/POST/PATCH/DELETE). Resource:

`pages`, `faq`, `testimonials`, `blog`, `knowledgeBase`, `legal`, `announcements`, `incidents`, `maintenance`.

Setiap resource memakai whitelist field dan schema validasi; minimum permission per resource (mis. `legal` → `legal:write`; `incidents`/`maintenance` → `status:write`; lainnya → `cms:write`).

## Health / Utility

| Method | Route | Keterangan |
|---|---|---|
| GET | `/api/csrf` | Keluarkan token CSRF (double-submit) |
| GET | `/api/health/maintenance` | Status maintenance (public, tanpa secret) |
