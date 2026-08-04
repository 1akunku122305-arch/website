# Deployment WangStore

## Kebutuhan Minimum

| Sumber daya | Minimum | Disarankan |
| --- | --- | --- |
| CPU | 2 vCore | 4 vCore |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB NVMe |
| OS | Ubuntu 22.04+, Debian 12, AlmaLinux 9, Rocky Linux 9 | Ubuntu 24.04 LTS |
| Node | 20+ | 22 LTS |

## Instalasi Satu Perintah

```bash
git clone https://github.com/hyunkk-ark/repo-website.git /opt/wangstore
cd /opt/wangstore
bash scripts/install.sh --docker --domain wangstore.id --email admin@wangstore.id
```

Installer mendeteksi platform, memasang dependensi, menyiapkan `.env` dengan rahasia acak, menjalankan migrasi, mengonfigurasi Nginx dan SSL, menjalankan layanan, lalu memverifikasi `/api/health`. Kata sandi owner awal dicetak satu kali — simpan dan segera ganti.

## Deployment Docker

```bash
cp .env.example .env
# Isi minimal: AUTH_SECRET, POSTGRES_PASSWORD, DATABASE_URL, NEXT_PUBLIC_SITE_URL
docker compose -f docker/docker-compose.yml --env-file .env up -d --build
docker compose -f docker/docker-compose.yml ps
curl -fsS http://127.0.0.1:3000/api/health
```

Empat layanan dijalankan:

| Layanan | Keterangan |
| --- | --- |
| `app` | Next.js standalone, pengguna non-root, init `tini`, healthcheck 30 detik |
| `postgres` | PostgreSQL 16, `database/schema.sql` diterapkan pada boot pertama |
| `redis` | Redis 7 dengan AOF dan kebijakan `allkeys-lru`, batas memori 256 MB |
| `nginx` | Terminasi TLS, rate limiting, header keamanan |

Volume persisten: `wangstore-data`, `wangstore-uploads`, `wangstore-postgres`, `wangstore-redis`, `wangstore-certs`.

Perintah harian:

```bash
docker compose -f docker/docker-compose.yml logs -f app
docker compose -f docker/docker-compose.yml restart app
docker compose -f docker/docker-compose.yml down          # hentikan (volume tetap)
docker compose -f docker/docker-compose.yml up -d --build # bangun ulang
```

## Deployment Bare-Metal dengan PM2

```bash
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # jalankan perintah yang dicetak agar aktif saat boot
```

PM2 berjalan dalam cluster mode memakai seluruh core dengan restart otomatis pada pemakaian memori 512 MB.

```bash
pm2 status
pm2 logs wangstore
pm2 reload wangstore    # reload tanpa downtime
pm2 monit
```

## Nginx dan SSL

```bash
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/proxy-params.conf /etc/nginx/proxy-params.conf
sudo cp nginx/wangstore.conf /etc/nginx/conf.d/wangstore.conf
sudo sed -i 's|server app:3000|server 127.0.0.1:3000|' /etc/nginx/conf.d/wangstore.conf
sudo sed -i 's|wangstore.id|domain-anda.com|g' /etc/nginx/conf.d/wangstore.conf
sudo nginx -t && sudo systemctl reload nginx
```

Sertifikat Let's Encrypt:

```bash
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
sudo certbot renew --dry-run    # verifikasi perpanjangan otomatis
```

## Pembaruan

```bash
cd /opt/wangstore
bash scripts/update.sh
```

Skrip membuat backup, menarik perubahan, membangun ulang, memuat ulang layanan, dan memverifikasi health. Bila health check gagal, skrip otomatis melakukan rollback ke revisi sebelumnya lalu membangun ulang.

## Backup dan Pemulihan

```bash
bash scripts/backup.sh                    # arsip ke backups/
bash scripts/backup.sh --keep 30          # ubah retensi
bash scripts/backup.sh --output /mnt/nas  # tujuan lain
bash scripts/restore.sh --latest          # pulihkan arsip terbaru
bash scripts/restore.sh backups/wangstore-20260725-030000.tar.gz
```

Arsip berisi datastore JSON, uploads, `.env`, dump PostgreSQL (bila tersedia), revisi Git, dan stempel waktu. Izin berkas arsip adalah `600`. `restore.sh` selalu membuat snapshot pra-restore ke `backups/pre-restore` sehingga pemulihan yang keliru dapat dibatalkan.

Jadwalkan backup harian:

```cron
0 3 * * * cd /opt/wangstore && bash scripts/backup.sh --quiet >> /var/log/wangstore-backup.log 2>&1
```

Salin arsip ke penyimpanan off-site secara berkala — backup yang berada di mesin yang sama dengan data aslinya bukan backup.

## Pemantauan

Endpoint `/api/health` cocok untuk uptime monitor eksternal, healthcheck load balancer, dan probe Kubernetes:

```yaml
livenessProbe:
  httpGet: { path: /api/health, port: 3000 }
  initialDelaySeconds: 20
  periodSeconds: 30
```

Log aplikasi tersedia melalui `docker compose logs` atau `pm2 logs`. Log Nginx berada di `/var/log/nginx/`.

## Penskalaan

**Vertikal** — tambah CPU dan RAM; PM2 cluster mode otomatis memanfaatkan core tambahan.

**Horizontal** — jalankan beberapa instance aplikasi di belakang load balancer. Yang perlu disesuaikan:

1. Pindahkan datastore ke PostgreSQL menggunakan `database/schema.sql`
2. Pindahkan rate limiting ke Redis (lihat `docs/SECURITY.md`)
3. Gunakan penyimpanan objek bersama untuk `uploads/`
4. Pastikan `AUTH_SECRET` identik di seluruh instance agar sesi valid di mana pun

## Pemecahan Masalah

| Gejala | Penanganan |
| --- | --- |
| Health check gagal | `docker compose logs app` atau `pm2 logs wangstore`; pastikan port 3000 bebas |
| 502 dari Nginx | Pastikan aplikasi berjalan dan `proxy_pass` mengarah ke host yang benar |
| Perubahan dashboard tidak muncul | Halaman publik bersifat dinamis; muat ulang tanpa cache. Periksa izin tulis pada `data/` |
| Sesi hilang setelah restart | `AUTH_SECRET` berubah atau berbeda antar instance |
| Build gagal saat mengambil font | Font dimuat via stylesheet, bukan saat build; pastikan tidak ada modifikasi pada `layout.tsx` |
| Izin ditolak pada `data/` | `chown -R 1001:1001 data uploads` untuk Docker, atau sesuaikan pemilik pada bare-metal |
