# Deployment — GitHub → Vercel → Supabase

WangStore dirancang untuk berjalan tanpa VPS: **Vercel (Next.js) + Supabase (PostgreSQL/Auth)**. Tidak ada dependency terhadap VPS, Docker, Nginx, PM2, atau systemd.

---

## 1. Supabase Setup

1. Buat project baru di [Supabase](https://supabase.com).
2. Catat:
   - **Project URL** (mis. `https://xxxx.supabase.co`)
   - **Anon/Publishable Key** (dipakai `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - **Service Role Key** (dipakai `SUPABASE_SERVICE_ROLE_KEY`, **server-only**)
   - Database connection string (bila perlu untuk koneksi langsung).
3. Buka **SQL Editor** dan jalankan seluruh isi **`database/schema.sql`**.
4. Row Level Security sudah didefinisikan di schema. Pastikan aktif (policy `enable row level security`).
5. **Authentication**:
   - Site URL: `https://<domain-wangstore>`
   - Redirect URLs: `https://<domain-wangstore>/**`
   - Gunakan URL production aktual, jangan hardcode domain development.

Seluruh SQL production tersedia di repository; jangan menjalankan SQL yang tidak ada di `database/schema.sql`.

## 2. Environment Variables

Buat salinan `.env.example` dan isi di Vercel (bukan di commit). Dikumpulkan per kelompok:

```env
# APP
NEXT_PUBLIC_SITE_NAME=WangStore
NEXT_PUBLIC_APP_URL=https://<domain-wangstore>

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only

# AUTH
JWT_SECRET=

# CLOUDFLARE (opsional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# WHATSAPP
WHATSAPP_NUMBER=

# EMAIL (opsional, bila provider email dipakai)
EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM=
```

Jangan mengirim `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, atau secret lain ke browser.

## 3. GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/wangstore.git
git push -u origin main
```

Pastikan `.env`/`.env.local`/secret **tidak** masuk repository (sudah diatur di `.gitignore`), sedangkan `.env.example` tetap masuk.

## 4. Vercel Deployment

1. Login Vercel → dashboard → **Add New → Project**.
2. Import repository `wangstore` dari GitHub.
3. Framework terdeteksi otomatis: **Next.js**.
4. Build Settings: gunakan standar Next.js (`npm run build`). Jangan tambahkan command yang tidak perlu.
5. **Environment Variables**: tambahkan seluruh variabel production di atas.
   - Pisahkan environment: Production / Preview / Development.
   - Jangan memakai secret production pada client.
6. Klik **Deploy**.
7. Setelah selesai, buka domain Vercel Anda.

## 5. Custom Domain

- Di Vercel dashboard → Project → **Settings → Domains** → tambahkan domain (mis. `wangstore.example`, `www.wangstore.example`).
- Ikuti **DNS record yang direkomendasikan Vercel** (CNAME/ALIAS). Jangan menulis IP atau record yang tidak sesuai dengan konfigurasi aktual.

## 6. Supabase + Vercel

Arsitektur production:

```
Vercel → Next.js → Supabase (PostgreSQL + Auth + Storage)
```

- **Jangan** menyimpan order, user, kupon, tiket, CMS, atau audit log ke filesystem serverless.
- Semua server-side code kompatibel dengan serverless (tidak memakai persistent filesystem, long-running process, atau in-memory global state sebagai database).
- Upload (jika dipakai) harus memakai Supabase Storage / object storage; jangan simpan permanen ke `/public/uploads`.

## 7. Database Migration

- Jalankan `database/schema.sql` via Supabase SQL Editor.
- Tidak ada tabel yang dibuat manual tanpa dokumentasi; semua migration tersimpan di repository.

## 8. Deployment Checklist

- [ ] Repository GitHub dibuat
- [ ] Supabase project dibuat
- [ ] `database/schema.sql` dijalankan
- [ ] RLS dikonfigurasi
- [ ] Authentication dikonfigurasi
- [ ] Redirect URL Supabase dikonfigurasi
- [ ] Environment variables Vercel dikonfigurasi
- [ ] Production URL dikonfigurasi
- [ ] Build berhasil
- [ ] Homepage berhasil
- [ ] Register berhasil
- [ ] Login berhasil
- [ ] Logout berhasil
- [ ] Server Builder berhasil
- [ ] Pricing API berhasil
- [ ] Order berhasil
- - WhatsApp redirect berhasil
- [ ] Customer dashboard berhasil
- [ ] Admin login berhasil
- [ ] RBAC berhasil
- [ ] Blog berhasil
- [ ] Knowledge Base berhasil
- [ ] Sitemap berhasil
- [ ] Robots berhasil
- [ ] Security headers aktif
- [ ] Custom domain dikonfigurasi

## 9. Production Verification

Setelah deploy, lakukan test terhadap URL production:

```
GET /  /about  /server-builder  /blog  /knowledge-base  /status  /contact  /terms  /privacy  /refund  /sla
```

Kemudian verifikasi alur: Register → Email verification → Login → Server Builder → Create Order → Order Confirmation → WhatsApp → Dashboard. Untuk Admin: Login → Admin Dashboard → Create/Edit Product → Edit Pricing → Create Coupon → Edit CMS → Audit Log. Verifikasi pricing API pada production endpoint.

## 10. Troubleshooting

**Build gagal** → cek `npm run build`.

**Supabase connection gagal** → cek `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

**Authentication gagal** → cek Supabase Site URL, Redirect URLs, dan production domain.

**Database permission error** → cek RLS, policies, `authenticated` role, dan service role usage.

**Environment variable tidak terbaca** → pastikan ditambahkan di environment Vercel yang benar lalu redeploy.

**API lokal OK tapi gagal di Vercel** → cek apakah kode memakai filesystem, local process, persistent memory, atau unsupported Node API; jika ya, refactor agar serverless-compatible.

## 11. Catatan Kejujuran

Proyek dianggap selesai **setelah** build berhasil, deployment Vercel berhasil, Supabase terhubung, database terpakai, auth berhasil, Server Builder berhasil, pricing API berhasil, order berhasil, customer & admin dashboard berhasil, dan production smoke test berhasil.

> Jika deployment tidak dapat diverifikasi, jangan mengklaim "Deployment berhasil". Sebutkan secara jujur bagian yang sudah diverifikasi dan yang belum. Pada environment ini, verifikasi dilakukan terhadap **local production build** (`next build` + `next start`) dengan JSON datastore fallback; verifikasi live di Vercel + Supabase memerlukan akses ke project tersebut.
