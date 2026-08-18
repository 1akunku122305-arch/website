# Keamanan WangStore

## 1. Prinsip

- **Never trust the browser.** Harga, kupon, role, status, activation_at, expires_at, dan renewable tidak pernah dipercaya dari browser; semuanya dihitung/diverifikasi server-side.
- Server/database time adalah sumber kebenaran untuk lifecycle.
- Least privilege: Supabase service role key hanya di server; RLS membatasi akses data.

## 2. Authentication & Session

- **Register / Login / Logout / Forgot / Reset / Email Verification / Profile / Change Password**.
- Kata sandi di-hash dengan **bcrypt cost 12** (bcryptjs, edge/serverless compatible).
- Session memakai **JWT (HS256)** via `jose`. Cookie: `HttpOnly`, `SameSite=Lax`, `Secure` di production.
- Login **timing-resistant**: email tidak dikenal memakai dummy hash comparison; respons error generic (tidak membocorkan keberadaan email).
- Email verification & password reset memakai opaque token; hanya SHA-256 hash yang disimpan.

## 3. RBAC

- Owner > Admin > Staff hanya hierarchy; otorisasi berbasis **permission matrix eksplisit** (`src/lib/auth/rbac.ts`).
- Setiap route admin memanggil `requirePermissionResponse`.
- Staff tidak otomatis dapat seluruh aksi Admin. Hanya Owner yang mengelola role.
- `roles:manage`, `audit:read`, `pricing:write`, `legal:write`, `services:lifecycle` dibatasi.
- Role tidak pernah dipercaya dari browser tanpa verifikasi server-side.

## 4. Request Pipeline (setiap API)

```
payload limit → authentication → CSRF → Zod → sanitization → normalization
→ authorization → business validation → server-side pricing → transaction → audit
```

- **Payload limit & recursive sanitization** (`src/lib/security/sanitize.ts`): batas panjang string, kedalaman objek, jumlah key, penghapusan control chars.
- **Zod** untuk validasi di setiap endpoint.
- **CSRF**: double-submit cookie + Origin/Host validation untuk semua state-changing request.

## 5. Rate Limiting

Sliding-window per instance (`src/lib/security/rate-limit.ts`), prioritas ketat:
- Login (5/5 menit), Register (5/jam), Password reset (3/10 menit), Order (20/5 menit), Contact (5/5 menit), Renewal (10/5 menit).

> **Catatan:** pada environment serverless, counter bersifat per-instance (best-effort). Untuk enforcement terdistribusi multi-region, tambahkan shared limiter (mis. Supabase/Redis-compatible).

## 6. HTTP Security Headers

`next.config.mjs` menambahkan:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy: same-origin`
- `Strict-Transport-Security`
- CSP diatur agar compatible dengan aplikasi (lihat catatan di bawah).

## 7. Bot Protection

Cloudflare Turnstile dapat diaktifkan (register/login/contact/order). Belum diimplementasikan sebagai dependency wajib; jika diaktifkan, verifikasi token server-side via `TURNSTILE_SECRET_KEY`. Tidak membuat CAPTCHA sendiri.

## 8. DDoS Disclosure

Perlindungan DDoS bergantung pada kapasitas dan kemampuan provider jaringan. WangStore **tidak menjanjikan perlindungan DDoS tanpa batas**; tidak ada klaim "Anti-DDoS 100%".

## 9. Payment & Order

- `PaymentProvider` adalah abstraction (manual / payment-gateway). Tanpa provider terkonfigurasi, tidak ada pembayaran sukses palsu.
- Tidak ada endpoint "mark paid" publik; konfirmasi pembayaran dilakukan oleh admin/verified webhook server-side.
- Order status transition divalidasi (whitelist).
- Tidak pernah menghasilkan total `Rp0`; kupon tidak boleh membuat order gratis.

## 10. Service Lifecycle

- `resolveServiceStatus` memakai server time; klien tidak dapat mengubah activation_at/expires_at/status/renewable.
- Renewal hanya oleh pemilik layanan atau staff berizin; expired service dimulai dari server now.
- Reminder idempotent (unique constraint).

## 11. Audit Log

Mencatat login, logout, failed login, create, update, delete, pricing change, coupon change, order modification, customer modification, CMS change, legal change, role change, maintenance change, service lifecycle, renewal, reminder, VPS change. Data: actor, action, resource, resourceId, timestamp, IP, metadata. **Tidak menyimpan password atau secret.** Hanya dibaca role berizin.

## 12. Database Security (Supabase)

- RLS diaktifkan: customer hanya melihat datanya sendiri; audit log hanya untuk service role; operator mengakses via service role key server-side.
- Foreign keys, unique constraints, check constraints untuk integritas data.
- `service_reminders` punya unique constraint `(service_id, reminder_type)` untuk mencegah duplikat.

## 13. JSON Fallback

- Hanya untuk local development.
- Gagal eksplisit di production/preview (mengecek env `VERCEL`).
- Tidak sama dengan production parity.

## 14. CSP Note

CSP diset agar compatible dengan aplikasi. Jika memakai script inline (theme toggle), pastikan CSP mengizinkan atau nonce/`unsafe-inline` untuk inline scripts yang diketahui. Verifikasi setelah deployment.
