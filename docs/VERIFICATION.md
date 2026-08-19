# Verifikasi WangStore

Dokumen ini mencatat secara jujur apa yang sudah diverifikasi dan apa yang belum.

## Lingkungan Verifikasi

- **Node** v22, **Next.js** 14.2.35 (patched), TypeScript strict.
- Dijalankan dengan **local production build** (`npm run build` + `next start`) dan **JSON datastore fallback** (Supabase tidak dikonfigurasi di environment ini).
- Smoke/API test dijalankan terhadap `http://localhost:3000`.

## Sudah Diverifikasi

| Area | Hasil |
|---|---|
| `npm run typecheck` (`tsc --noEmit`) | 0 error ✓ |
| `npm run lint` | 0 error, 0 warning ✓ |
| `npm run build` | sukses ✓ |
| `npm test` (34 tes) | semua lulus ✓ |
| `npm run smoke` (HTTP) | semua lulus ✓ |
| Public pages (/, about, infrastructure, server-builder, features, why, faq, testimonials, blog, knowledge-base, status, contact, terms, privacy, refund, sla, acceptable-use, cookie-policy) | HTTP 200 ✓ |
| Pricing API: Low minimum 2/4/20 → Rp45.000 | ✓ |
| Pricing API: Low overflow 20/64/900 → 16/32/160 | ✓ |
| Pricing API: semua High package harga tepat | ✓ |
| Pricing API: Medium → 409 (ongoing) | ✓ |
| Pricing API: paket High palsu → 422 | ✓ |
| Order: tanpa persetujuan → 422 | ✓ |
| Order: Medium → 409 | ✓ |
| Order: paket palsu → 422 | ✓ |
| Order valid Low → 201, total Rp45.000 (client price diabaikan) | ✓ |
| CSRF cross-origin write → 403 | ✓ |
| Guest `/dashboard` → redirect `/login` | ✓ |
| Auth: register, login, logout, admin login (owner), salah password → 401 | ✓ |
| RBAC admin: owner dapat analitik/audit/settings | ✓ |
| RBAC staff: ditolak audit-logs, pricing-write, roles-manage (403); dapat analytics/orders/customers (200) | ✓ |
| Role management: owner menaikkan customer → staff | ✓ |
| Medium transition: ongoing→available→maintenance tercermin di pricing API | ✓ |
| Service creation via order konfirmasi (paid) → status active | ✓ |
| Customer hanya akses layanan miliknya (cross-customer → 403) | ✓ |
| Rate limiting login aktif (429 setelah batas) | ✓ |
| **Email verification: register → `email_verified=false`** | ✓ |
| **Email verification: token sekali pakai (reuse → invalid)** | ✓ |
| **Email verification: token kedaluwarsa → `expired`, akun tetap terkunci** | ✓ |
| **Email verification: akun sudah terverifikasi → `already_verified`** | ✓ |
| **Email verification: dashboard & API terproteksi diblokir sebelum verifikasi (`403 email_not_verified` / redirect)** | ✓ |
| **Email verification: verifikasi berhasil → akun aktif, dashboard 200** | ✓ |
| **Email verification: kirim ulang — cooldown 60s (429 + retryAfterSeconds)** | ✓ |
| **Email verification: kirim ulang — batas harian & per-IP (unit test)** | ✓ |
| **Email verification: anti-enumerasi (email tak dikenal → respons generik)** | ✓ |
| **Email verification: registrasi email duplikat case-insensitive → 400** | ✓ |
| **Password reset: token sekali pakai + login password baru/lama (end-to-end)** | ✓ |
| **Email template verifikasi/reset (CTA, tautan alternatif, TTL, catatan abaikan, escaping HTML)** | ✓ |
| **Backfill akun lama: staff/admin → terverifikasi, customer tetap diverifikasi saat login** | ✓ |

## Belum Diverifikasi di Environment Ini (Perlu Akses Live)

Berikut **tidak** diverifikasi karena memerlukan project Supabase/Vercel live:

- Koneksi **Supabase** live (PostgreSQL, RLS, Auth).
- `database/schema.sql` dieksekusi pada Supabase SQL Editor.
- Deployment **Vercel** (build di environment Vercel, custom domain, env production).
- Email delivery **live** (provider email belum dikonfigurasi di environment ini; fallback development menampilkan tautan verifikasi/reset lokal dan seluruh alur sudah diverifikasi end-to-end tanpa provider).
- Payment gateway (belum ada provider; order berstatus `awaiting_payment` dan dikonfirmasi manual oleh admin).
- WhatsApp delivery (URL `wa.me` dibuat dari `WHATSAPP_NUMBER`; pengiriman aktual tergantung WhatsApp).
- Reminder terkirim otomatis (scheduler serverless perlu dikonfigurasi; idempotency didukung oleh unique constraint).

## Catatan Kejujuran

- **Tidak ada testimoni/customer/server/statistik palsu.** Koleksi testimonial di-seed kosong; admin harus memasukkan data nyata.
- **Tidak ada hardware/uptime/lokasi palsu.** Halaman Infrastruktur menyatakan "Informasi infrastruktur sedang diperbarui."
- **Tidak ada pembayaran sukses palsu.** Tanpa provider, order menunggu konfirmasi.
- Deployment live **belum diklaim berhasil**; dokumen ini memisahkan verifikasi lokal dari verifikasi production.
