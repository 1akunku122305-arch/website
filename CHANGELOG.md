# Changelog

## [1.1.0] - 2026-08-19

### Added — Revisi Email Verification & Activation
- Verifikasi email **wajib**: akun baru dibuat `email_verified=false`; akses dashboard/admin/API terproteksi diblokir hingga terverifikasi (`403 email_not_verified`).
- Token verifikasi 256-bit acak, disimpan sebagai SHA-256 hash, sekali pakai, TTL 60 menit (env-configurable), anti-replay & anti-brute-force (rate limit).
- Halaman `/verify-email` dengan status: sukses, sudah terverifikasi, kedaluwarsa, tidak valid — plus form **Kirim Ulang** dengan countdown 60 detik.
- Endpoint `POST /api/auth/resend-verification`: cooldown per-user, rate limit per-IP, batas harian per-user, pembatalan token lama.
- Template email verifikasi & reset password profesional/responsive (CTA, tautan alternatif, info TTL, catatan abaikan, escaping HTML).
- Provider email nyata: `EMAIL_PROVIDER=resend` (REST) atau `EMAIL_PROVIDER=smtp` (nodemailer); kredensial hanya dari env, error delivery ditangani.
- `email_verified_at` di `users`/`profiles`; indeks token; backfill aman akun lama (staff/admin terverifikasi, customer wajib verifikasi saat login).
- `DataStore.find()` (Supabase `.eq` / JSON) untuk lookup token terindeks.
- Tes unit/integrasi email verification (13 tes baru) + verifikasi flow end-to-end.

## [1.0.0] - 2026-08-18

### Added
- Server Builder (Tier Low/Medium/High, konfigurasi custom, paket tetap, estimasi performa).
- Shared pricing engine (server-authoritative).
- Order flow + WhatsApp redirect + order confirmation.
- VPS Package Store (dari database).
- Service lifecycle (aktivasi, kedaluwarsa, perpanjangan, reminder).
- Auth (register, login, logout, forgot/reset, email verification, profile, change password).
- RBAC (Owner > Admin > Staff + permission matrix).
- Customer portal dan Admin panel lengkap.
- Generic CMS (pages, faq, testimonials, blog, knowledge base, legal, insiden, maintenance, pengumuman).
- Status page, blog, knowledge base, FAQ, legal pages, sitemap, robots, structured data.
- Audit log, analitik, rate limiting, CSRF, security headers.
- Supabase schema, JSON local fallback, tests, smoke test, GitHub Actions.
