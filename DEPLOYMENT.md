# WangStore Enterprise — Deployment Guide

**Versi:** 2026.08  
**Status:** Production Ready

---

## 1. Prerequisites

Sebelum deploy, pastikan kamu memiliki:

- **Server / VPS** minimal 2 Core / 4 GB RAM (rekomendasi: 4 Core / 8 GB+)
- **Domain** (opsional tapi sangat disarankan)
- **Docker & Docker Compose** (rekomendasi utama)
- **PostgreSQL** (bisa pakai managed service atau self-hosted)
- **Pterodactyl Panel** (sudah terinstall dan berjalan)
- **SMTP Account** (Gmail, Mailgun, SendGrid, dll)

---

## 2. Quick Deploy dengan Docker (Recommended)

### Langkah 1: Clone Repository

```bash
git clone https://github.com/1akunku122305-arch/website.git wangstore
cd wangstore
git checkout arena/019fcb13-website
```

### Langkah 2: Setup Environment

```bash
cp .env.example .env
nano .env
```

Isi file `.env` dengan nilai yang benar (lihat penjelasan di bawah).

### Langkah 3: Jalankan Docker Compose

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

### Langkah 4: Setup Database

```bash
# Masuk ke container app
docker exec -it wangstore-app sh

# Jalankan migrasi Prisma
npx prisma migrate deploy
npx prisma generate

# Seed data awal (opsional)
npm run seed
```

### Langkah 5: Restart Container

```bash
docker compose -f docker/docker-compose.yml restart
```

---

## 3. Konfigurasi Environment Variables

Berikut penjelasan lengkap file `.env`:

### Wajib

| Variable | Contoh | Keterangan |
|---------|--------|----------|
| `NEXT_PUBLIC_SITE_URL` | `https://wangstore.id` | URL website kamu |
| `AUTH_SECRET` | `openssl rand -base64 48` | Secret untuk JWT |
| `DATABASE_URL` | `postgresql://...` | Koneksi PostgreSQL |
| `SMTP_USER` | `noreply@wangstore.id` | Email pengirim |
| `SMTP_PASS` | `xxxx-xxxx-xxxx` | App Password SMTP |
| `PTERODACTYL_URL` | `https://panel.wangstore.id` | URL Pterodactyl Panel |
| `PTERODACTYL_API_KEY` | `ptla_xxxxxxxx` | Application API Key Pterodactyl |

### Opsional

| Variable | Default | Keterangan |
|---------|---------|----------|
| `REDIS_URL` | `redis://redis:6379` | Untuk rate limiting |
| `ADMIN_EMAIL` | - | Email notifikasi admin |
| `WANGSTORE_DATA_DIR` | `./data` | Folder data JSON (fallback) |

---

## 4. Setup Pterodactyl Panel

### Langkah 1: Buat Application API Key

1. Login ke Pterodactyl Panel sebagai **Admin**
2. Pergi ke **Application API**
3. Buat API Key baru dengan permission:
   - `Users: Create, Read, Update`
   - `Servers: Create, Read, Update`
4. Copy API Key tersebut ke `.env`

### Langkah 2: Konfigurasi Node

Pastikan node Pterodactyl sudah memiliki:
- Allocation yang cukup
- Egg Minecraft (Paper/Purpur/Fabric)
- Docker image `ghcr.io/pterodactyl/yolks:java_21`

---

## 5. Setup SMTP (Email)

### Gmail (Paling Mudah)

1. Aktifkan **2-Step Verification** di akun Gmail
2. Buat **App Password**
3. Isi `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@wangstore.id
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
```

### Alternatif Lain

- **Mailgun**
- **SendGrid**
- **Amazon SES**
- **Zoho Mail**

---

## 6. Post-Deployment Steps

### 1. Buat Akun Owner Pertama

```bash
docker exec -it wangstore-app npm run create-owner
```

Atau manual via database.

### 2. Verifikasi Health Check

Buka:
```
https://wangstore.id/api/health
```

Harus mengembalikan status `ok`.

### 3. Test Alur Utama

1. Daftar akun baru → Cek email verifikasi
2. Login ke portal
3. Buat server di Builder
4. Approve order di Admin Panel
5. Cek apakah server muncul di Pterodactyl

---

## 7. Struktur Docker Compose

File: `docker/docker-compose.yml`

Service yang dijalankan:

| Service | Port | Keterangan |
|---------|------|----------|
| `app` | 3000 | Next.js Application |
| `postgres` | 5432 | Database |
| `redis` | 6379 | Cache & Rate Limit |
| `nginx` | 80 / 443 | Reverse Proxy + SSL |

---

## 8. SSL / HTTPS (Production)

### Menggunakan Nginx + Certbot (Recommended)

Tambahkan di `docker-compose.yml`:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    - ./nginx/wangstore.conf:/etc/nginx/conf.d/default.conf
    - ./certbot/conf:/etc/letsencrypt
    - ./certbot/www:/var/www/certbot
```

Jalankan:

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d wangstore.id
```

---

## 9. Backup Strategy

### Database Backup

```bash
# Backup harian otomatis
docker exec postgres pg_dump -U wangstore wangstore > backup_$(date +%F).sql
```

### File Backup

Backup folder:
- `uploads/`
- `data/` (jika masih pakai JSON)
- `.env`

---

## 10. Troubleshooting

### Aplikasi tidak bisa connect ke database

```bash
docker logs wangstore-app
# Cek DATABASE_URL
```

### Email tidak terkirim

Pastikan `SMTP_USER` dan `SMTP_PASS` benar. Coba test dengan:

```bash
docker exec -it wangstore-app node -e "
const nodemailer = require('nodemailer');
..."
```

### Server tidak muncul di Pterodactyl

Pastikan:
- `PTERODACTYL_URL` dan `PTERODACTYL_API_KEY` benar
- Node memiliki allocation yang cukup
- Egg ID sesuai (default: 1 = Minecraft)

---

## 11. Update Aplikasi

```bash
git pull origin arena/019fcb13-website
docker compose -f docker/docker-compose.yml up -d --build
docker exec -it wangstore-app npx prisma migrate deploy
```

---

## 12. Checklist Production

- [ ] `.env` sudah diisi dengan benar
- [ ] `DATABASE_URL` valid dan bisa konek
- [ ] SMTP berhasil mengirim email
- [ ] Pterodactyl API Key valid
- [ ] SSL aktif (HTTPS)
- [ ] Health check `/api/health` mengembalikan OK
- [ ] Owner account sudah dibuat
- [ ] Backup strategy sudah disiapkan
- [ ] Monitoring (opsional) sudah aktif

---

**Dokumen ini dibuat untuk WangStore Enterprise v2026.08**

Jika ada pertanyaan atau butuh bantuan deployment, hubungi tim WangStore.