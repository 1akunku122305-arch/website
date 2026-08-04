<div align="center">

# WangStore

**Build Your Own Server.**

Platform hosting produksi untuk **Minecraft Hosting**, **VPS**, **Dedicated Server**, dan **Panel Hosting** — dengan identitas visual *Neo-Brutalism × Premium Gaming × Modern SaaS*.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-c3ff3e?style=for-the-badge)

</div>

---

## Daftar Isi

- [Sekilas](#sekilas)
- [Fitur Utama](#fitur-utama)
- [Tumpukan Teknologi](#tumpukan-teknologi)
- [Instalasi Satu Perintah](#instalasi-satu-perintah)
- [Pengembangan Lokal](#pengembangan-lokal)
- [Struktur Proyek](#struktur-proyek)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Server Builder & Formula Harga](#server-builder--formula-harga)
- [Alur Pemesanan](#alur-pemesanan)
- [Admin Panel](#admin-panel)
- [API](#api)
- [Keamanan](#keamanan)
- [Pengerasan DDoS](#pengerasan-ddos)
- [Deployment](#deployment)
- [Operasional](#operasional)
- [Dokumentasi](#dokumentasi)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Sekilas

WangStore adalah aplikasi web lengkap — bukan template atau mockup. Setiap halaman berisi konten nyata, setiap tombol terhubung ke API yang berfungsi, dan seluruh isi situs dapat disunting dari dashboard tanpa menyentuh kode.

Aplikasi berjalan langsung setelah `npm install && npm run dev`, tanpa memerlukan database eksternal: datastore JSON ber-antrean tulis (`src/lib/db.ts`) melakukan seeding otomatis saat pertama kali dijalankan. Untuk deployment berskala, tersedia skema PostgreSQL yang identik (`database/schema.sql`) beserta stack Docker berisi PostgreSQL, Redis, dan Nginx.

**Halaman publik:** Home · About · Infrastructure · Server Builder · Features · Why WangStore · FAQ · Testimonials · Blog · Knowledge Base · Status · Contact · Terms · Privacy · Refund · SLA · Acceptable Use · Cookie Policy

---

## Fitur Utama

### Server Builder tanpa paket

Tidak ada paket kaku. Setiap sumber daya dipilih terpisah dan harga dihitung ulang seketika di sisi klien maupun diverifikasi ulang di server.

| Kategori | Opsi |
| --- | --- |
| Compute | CPU 2–32 vCore, RAM 4–256 GB |
| Storage | SSD, NVMe Gen4, HDD (masing-masing terpisah) |
| Jaringan | Bandwidth 1–100 TB, dedicated IPv4, port tambahan |
| Sistem | Ubuntu, Debian, AlmaLinux, Rocky Linux, Windows Server |
| Runtime | Java 8/11/17/21, Minecraft 1.8.9–1.21.4 |
| Software | Paper, Purpur, Fabric, Forge, NeoForge, Vanilla, Velocity, Waterfall |
| Panel | Pterodactyl, Reviactyl, atau tanpa panel |
| Add-on | Automatic backup, priority support, advanced DDoS |
| Region | 🇮🇩 Indonesia · 🇸🇬 Singapura · 🇯🇵 Jepang · 🇩🇪 Jerman · 🇺🇸 Amerika Serikat |

**Estimasi realtime:** harga bulanan, TPS, jumlah pemain konkuren, beban CPU, pemakaian RAM, rekomendasi jumlah plugin, dan grade build — semuanya dari satu model kapasitas deterministik (`estimateMetrics`) yang dipakai bersama oleh UI dan API.

Konfigurasi minimum: **2 Core · 4 GB RAM · 20 GB SSD · Rp45.000/bulan**.

### Alur pemesanan berbasis WhatsApp

Pelanggan mengisi nama, WhatsApp, email, nama server, catatan, dan kupon. Server memvalidasi ulang seluruh konfigurasi, menghitung ulang harga (harga dari klien tidak pernah dipercaya), menyimpan pesanan, menaikkan pemakaian kupon, mencatat audit log, lalu mengembalikan tautan `https://wa.me/<nomor>?text=<pesan terformat>` sekaligus mengarahkan pelanggan ke halaman konfirmasi pesanan.

### Admin panel penuh

Login aman dengan tiga peran (**Owner · Admin · Staff**) dan 20 modul: Ringkasan, Pesanan, Pelanggan, Tiket, Formula Harga, Kupon & Promosi, Analitik, Blog, Knowledge Base, FAQ, Testimoni, Halaman & Legal, Infrastruktur, Lokasi Server, Insiden & Maintenance, Pengumuman, Tema & Branding, Sosial & Kontak, Mode Maintenance, dan Audit Log.

### Portal pelanggan

Riwayat pesanan, tiket dukungan beserta balasan, konfigurasi tersimpan (lanjutkan kapan saja di builder), serta pintasan WhatsApp, Discord, dan knowledge base.

### Status page transparan

Uptime per node, status per region, pemeliharaan terjadwal, dan kronologi insiden lengkap — otomatis menyegarkan setiap 60 detik.

### Blog & knowledge base

Markdown penuh (GFM, tabel, kode), kategori, tag, pencarian lintas isi artikel, metadata SEO per halaman, OpenGraph, Twitter Cards, dan structured data `BlogPosting` / `TechArticle`.

---

## Tumpukan Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, standalone output) |
| Bahasa | TypeScript strict |
| UI | React 19, Tailwind CSS v4, Framer Motion, lucide-react |
| Validasi | Zod (skema bersama untuk klien dan server) |
| Autentikasi | Sesi JWT `jose` (HttpOnly, SameSite), bcrypt cost 12, RBAC |
| Konten | marked (Markdown → HTML), CMS berbasis dashboard |
| Data | Datastore JSON ber-antrean tulis + skema PostgreSQL 16 |
| Cache | Redis 7 (stack Docker) |
| Proses | Docker multi-stage, PM2 cluster mode |
| Edge | Nginx (rate limit, connection limit, TLS, header keamanan) |
| CI/CD | GitHub Actions: typecheck, lint, build, smoke test, ShellCheck, audit, CodeQL, Docker build |

---

## Instalasi Satu Perintah

```bash
git clone https://github.com/hyunkk-ark/repo-website.git wangstore
cd wangstore
bash scripts/install.sh
```

Installer otomatis:

1. Mendeteksi platform dan package manager (apt/dnf/yum/apk/brew)
2. Memasang dependensi dasar (`curl`, `git`, `openssl`)
3. Memasang Docker Engine **atau** Node.js 22 + PM2 (mode dipilih otomatis)
4. Membuat `.env` dengan `AUTH_SECRET`, kata sandi database, dan kata sandi owner acak
5. Mengonfigurasi PostgreSQL dan Redis, lalu menjalankan migrasi `database/schema.sql`
6. Mengonfigurasi Nginx sebagai reverse proxy dengan header keamanan
7. Menerbitkan sertifikat SSL Let's Encrypt bila `--domain` diberikan
8. Menjalankan layanan dan memverifikasi `/api/health`

**Produksi dengan domain dan SSL:**

```bash
bash scripts/install.sh --docker --domain wangstore.id --email admin@wangstore.id
```

Opsi: `--docker` · `--bare` · `--domain <domain>` · `--email <email>` · `--skip-ssl`

> Installer mencetak kata sandi owner awal satu kali. **Ganti segera setelah login pertama.**

---

## Pengembangan Lokal

```bash
npm install
cp .env.example .env      # opsional untuk pengembangan
npm run dev               # http://localhost:3000
```

Perintah lain:

```bash
npm run build             # build produksi (standalone)
npm run start             # jalankan hasil build
npm run lint              # ESLint
npx tsc --noEmit          # typecheck
```

Datastore melakukan seeding otomatis ke `data/wangstore.json` saat permintaan pertama. Hapus file tersebut kapan saja untuk kembali ke data awal.

**Kredensial dashboard awal (pengembangan):**

```
Email    : owner@wangstore.id
Password : WangStore#2026
```

---

## Struktur Proyek

```
.
├── src/
│   ├── app/                      # Rute App Router
│   │   ├── api/                  # Route handler (orders, auth, admin, status, health)
│   │   ├── blog/[slug]/          # Blog + artikel dinamis
│   │   ├── knowledge-base/[slug]/
│   │   ├── legal/[slug]/         # Enam dokumen legal dari CMS
│   │   ├── order/[id]/           # Konfirmasi pesanan
│   │   ├── dashboard/            # Admin panel (terlindungi middleware)
│   │   ├── sitemap.ts robots.ts  # SEO
│   │   └── layout.tsx page.tsx
│   ├── components/
│   │   ├── ui/                   # Primitif desain (Button, Card, Field, Meter, …)
│   │   ├── site/                 # Header, Footer, Hero, Builder, Status, forms
│   │   └── dashboard/            # Shell + 20 modul admin
│   ├── lib/
│   │   ├── db.ts                 # Datastore transaksional
│   │   ├── seed.ts               # Konten produksi awal
│   │   ├── pricing.ts            # Formula harga + model kapasitas
│   │   ├── auth.ts               # Sesi JWT, bcrypt, RBAC
│   │   ├── validation.ts         # Skema Zod + sanitasi
│   │   ├── rate-limit.ts         # Pembatas laju
│   │   ├── api.ts                # Helper respons, CSRF, error
│   │   └── content.ts utils.ts types.ts
│   └── middleware.ts             # CSP, HSTS, gating dashboard
├── database/schema.sql           # Skema PostgreSQL 16
├── docker/                       # Dockerfile multi-stage + compose stack
├── nginx/                        # Konfigurasi Nginx, Fail2Ban, filter
├── scripts/                      # install · update · backup · restore · lib
├── docs/                         # Arsitektur, deployment, keamanan, API
├── public/brand/                 # Logo, favicon, maskot
├── data/ uploads/                # Volume runtime (di-gitignore)
└── .github/                      # Workflows, issue & PR template, Dependabot
```

---

## Konfigurasi Environment

Salin `.env.example` menjadi `.env`. Variabel terpenting:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ya (produksi) | URL kanonik untuk sitemap, OpenGraph, dan canonical tag |
| `AUTH_SECRET` | ya (produksi) | Kunci penandatangan sesi — `openssl rand -base64 48` |
| `WANGSTORE_DATA_DIR` | tidak | Lokasi datastore JSON (default `./data`) |
| `DATABASE_URL` | stack Docker | Koneksi PostgreSQL |
| `REDIS_URL` | stack Docker | Koneksi Redis |
| `PORT` | tidak | Port aplikasi (default `3000`) |

---

## Server Builder & Formula Harga

Harga dihitung dari komponen yang seluruhnya dapat disunting di **Dashboard → Formula Harga**:

```
subtotal  = base
          + cpu        × perCore
          + ram        × perGbRam
          + ssd        × perGbSsd
          + nvme       × perGbNvme
          + hdd        × perGbHdd
          + bandwidth  × perTbBandwidth
          + add-on (panel, dedicated IP, port, backup, priority, DDoS)

bulanan   = max(45.000, round(subtotal × pengaliRegion / 500) × 500)
total     = bulanan × bulanSiklus × (1 − diskonSiklus) − diskonKupon
```

Diskon siklus: bulanan 0%, 3 bulan 5%, 12 bulan 15%. Pengali region disunting per lokasi di **Dashboard → Lokasi Server**.

Seluruh nilai dihitung ulang di server saat pesanan dibuat, sehingga manipulasi harga dari sisi klien tidak berpengaruh.

---

## Alur Pemesanan

```
Server Builder → validasi klien → POST /api/orders
      → validasi Zod + normalisasi konfigurasi
      → verifikasi region & kupon
      → perhitungan ulang harga di server
      → simpan pesanan + naikkan pemakaian kupon + audit log
      → kembalikan wa.me URL berisi pesanan terformat
      → buka WhatsApp + arahkan ke /order/<id>
```

Bila jaringan gagal saat pengiriman, builder tetap membuka WhatsApp dengan ringkasan yang disusun di klien sehingga pemesanan tidak pernah buntu.

---

## Admin Panel

Masuk melalui `/login`. Middleware mengalihkan permintaan tanpa sesi, dan setiap route handler memverifikasi ulang peran di sisi server.

| Peran | Kemampuan |
| --- | --- |
| **Staff** | Melihat seluruh modul, mengelola pesanan dan tiket |
| **Admin** | Seluruh kemampuan Staff + konten, harga, kupon, infrastruktur, tema, pengaturan |
| **Owner** | Seluruh kemampuan Admin + kontrol penuh |

Semua konten situs — logo, favicon, maskot, judul, hero, footer, warna merek, tautan sosial, informasi kontak, halaman Tentang, dan keenam dokumen legal — disunting dari dashboard tanpa menyentuh kode.

---

## API

| Metode | Endpoint | Auth | Batas laju | Fungsi |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | — | — | Probe liveness/readiness |
| `GET` | `/api/status` | — | — | Status node dan insiden |
| `POST` | `/api/orders` | — | 8 / menit | Buat pesanan, hasilkan tautan WhatsApp |
| `GET` | `/api/orders?email=` | — | 20 / menit | Riwayat pesanan pelanggan |
| `POST` | `/api/coupons/validate` | — | 20 / menit | Validasi kupon dan hitung diskon |
| `POST` | `/api/tickets` | — | 5 / 10 menit | Buat tiket dukungan |
| `GET` | `/api/tickets?email=` | — | 20 / menit | Tiket milik pelanggan |
| `POST` | `/api/auth/login` | — | 6 / 5 menit | Masuk dan buat sesi |
| `POST` | `/api/auth/logout` | sesi | — | Akhiri sesi |
| `GET` | `/api/admin/:resource` | Staff+ | — | Baca koleksi CMS |
| `POST` | `/api/admin/:resource` | Admin/Staff | 120 / menit | Buat atau perbarui entri |
| `DELETE` | `/api/admin/:resource?id=` | Admin+ | — | Hapus entri |

Seluruh respons berbentuk `{ ok: true, data }` atau `{ ok: false, error }`. Detail lengkap ada di [`docs/API.md`](docs/API.md).

---

## Keamanan

- **Sesi** — JWT HS256 melalui `jose`, cookie HttpOnly + SameSite=Lax + Secure, kedaluwarsa 8 jam
- **Kata sandi** — bcrypt cost 12; perbandingan dummy pada email tak dikenal untuk mencegah enumerasi lewat timing
- **RBAC** — hierarki Owner > Admin > Staff, diverifikasi ulang di setiap route handler
- **CSRF** — pemeriksaan Origin terhadap Host pada seluruh permintaan yang mengubah state, ditambah cookie double-submit
- **XSS** — sanitasi rekursif seluruh string masukan CMS, escaping otomatis React, CSP ketat
- **Injeksi SQL** — skema PostgreSQL memakai query berparameter; datastore JSON tidak menyusun SQL sama sekali
- **CSP & header** — CSP, HSTS preload, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy, COOP (setara Helmet, diterapkan di middleware dan Nginx)
- **Validasi input** — skema Zod pada setiap endpoint, batas payload 100 KB, enum ketat untuk seluruh pilihan konfigurasi
- **Rate limiting** — per IP per endpoint di aplikasi, ditambah zona `limit_req`/`limit_conn` di Nginx
- **Audit log** — login (berhasil dan gagal), setiap pembuatan, perubahan, dan penghapusan data
- **Siap 2FA** — kolom `totp_secret` tersedia pada skema dan struktur sesi

Detail lengkap dan checklist pengerasan produksi ada di [`docs/SECURITY.md`](docs/SECURITY.md).

---

## Pengerasan DDoS

Konfigurasi siap pakai tersedia untuk tiga lapisan:

- **Nginx** (`nginx/nginx.conf`, `nginx/wangstore.conf`) — zona `limit_req` (umum 30 r/s, API 10 r/s, login 1 r/s), `limit_conn` per IP dan per server, deteksi bot buruk lewat User-Agent, pemblokiran metode tidak sah, penolakan jalur probe umum, timeout ketat, dan restorasi IP asli di belakang Cloudflare
- **Cloudflare** (`docs/SECURITY.md`) — managed WAF ruleset, rate limiting rules, bot fight mode, mode Under Attack, dan aturan khusus endpoint login/order
- **Fail2Ban** (`nginx/fail2ban-wangstore.conf` + dua filter) — jail untuk SSH, auth Nginx, pelanggaran rate limit, bot buruk, brute force login WangStore, dan pemindai kerentanan

> **Catatan jujur:** mitigasi DDoS bergantung pada kapasitas transit dan kerja sama penyedia hulu. Tidak ada skrip, firewall, atau konfigurasi yang dapat menjamin kekebalan mutlak — serangan volumetrik yang melampaui kapasitas uplink tetap dapat menyebabkan degradasi. Konfigurasi di repositori ini menangani abuse di lapisan aplikasi dan jaringan tepi; perlindungan volumetrik harus datang dari penyedia infrastruktur Anda.

---

## Deployment

### Docker (disarankan)

```bash
cp .env.example .env    # isi AUTH_SECRET dan kata sandi database
docker compose -f docker/docker-compose.yml --env-file .env up -d --build
```

Menjalankan empat layanan dengan healthcheck dan volume persisten: aplikasi (standalone, non-root, tini), PostgreSQL 16 (skema diterapkan otomatis), Redis 7 (AOF, kebijakan LRU), dan Nginx (TLS terminasi, rate limiting).

### Bare-metal dengan PM2

```bash
npm ci && npm run build
pm2 start ecosystem.config.js && pm2 save
```

Berjalan dalam cluster mode memanfaatkan seluruh core, dengan restart otomatis pada batas memori 512 MB.

Panduan lengkap termasuk SSL, backup terjadwal, dan penskalaan ada di [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Operasional

```bash
bash scripts/install.sh    # instalasi satu perintah
bash scripts/update.sh     # backup → pull → build → restart → health check → rollback otomatis
bash scripts/backup.sh     # arsip datastore, uploads, .env, dan dump PostgreSQL
bash scripts/restore.sh --latest   # pulihkan arsip terbaru (snapshot pra-restore dibuat lebih dulu)
```

`update.sh` melakukan rollback otomatis ke revisi sebelumnya bila health check gagal. `backup.sh` menyimpan 14 arsip terbaru dengan izin `600`. Jadwalkan lewat cron:

```cron
0 3 * * * cd /opt/wangstore && bash scripts/backup.sh --quiet
```

---

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Alur data, lapisan aplikasi, model harga, keputusan desain |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Docker, bare-metal, SSL, penskalaan, pemantauan |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Model ancaman, kontrol keamanan, Cloudflare, Fail2Ban, checklist |
| [`docs/API.md`](docs/API.md) | Referensi endpoint lengkap dengan contoh permintaan |

---

## Kontribusi

Baca [`CONTRIBUTING.md`](CONTRIBUTING.md) untuk standar kode, konvensi commit, dan alur pull request. Riwayat perubahan ada di [`CHANGELOG.md`](CHANGELOG.md).

---

## Lisensi

Dirilis di bawah [Lisensi MIT](LICENSE).

<div align="center">

**WangStore** — Build Your Own Server.

</div>
