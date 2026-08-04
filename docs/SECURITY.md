# Keamanan WangStore

## Melaporkan Kerentanan

Jangan membuka issue publik. Gunakan [GitHub Security Advisory](https://github.com/hyunkk-ark/repo-website/security/advisories/new) atau email `halo@wangstore.id`. Kami menanggapi dalam 48 jam.

## Kontrol yang Diterapkan

### Autentikasi dan sesi

| Kontrol | Implementasi |
| --- | --- |
| Hashing kata sandi | bcrypt cost 12 |
| Anti-enumerasi pengguna | Perbandingan bcrypt dummy dijalankan untuk email tak dikenal agar waktu respons seragam |
| Token sesi | JWT HS256 ditandatangani `jose`, klaim issuer diverifikasi |
| Penyimpanan cookie | `HttpOnly`, `SameSite=Lax`, `Secure` di produksi, masa berlaku 8 jam |
| Batas percobaan login | 6 percobaan per 5 menit per IP di aplikasi, ditambah 1 r/s di Nginx |
| Audit | Login berhasil dan gagal dicatat beserta aktor dan waktu |
| Siap 2FA | Kolom `totp_secret` tersedia di skema; struktur sesi mendukung penambahan faktor kedua |

### Otorisasi

Hierarki peran `OWNER > ADMIN > STAFF` diperiksa dua kali: middleware menolak akses `/dashboard` tanpa cookie sesi, dan setiap route handler memanggil `requireRole()` yang memverifikasi tanda tangan JWT serta peringkat peran. Middleware saja tidak pernah dijadikan satu-satunya penjaga.

### Validasi masukan

Setiap endpoint memvalidasi payload dengan skema Zod sebelum menyentuh data. Nilai numerik dibatasi rentang, seluruh pilihan konfigurasi menggunakan enum ketat, dan konfigurasi dinormalisasi ulang (`normalizeConfig`) sehingga nilai di luar batas dipangkas, bukan ditolak diam-diam.

Fungsi `sanitizeText` menghapus tag HTML dan karakter kontrol dari setiap string, diterapkan rekursif pada seluruh payload CMS.

### Proteksi CSRF

Setiap permintaan yang mengubah state memanggil `assertSameOrigin()` yang membandingkan header `Origin` dengan `Host`. Ditambah cookie double-submit `wangstore_csrf` dan kebijakan cookie `SameSite=Lax`.

### Proteksi XSS

- React melakukan escaping otomatis pada seluruh interpolasi
- Masukan CMS disanitasi saat penulisan
- `dangerouslySetInnerHTML` hanya dipakai untuk Markdown tepercaya milik admin dan untuk JSON-LD
- CSP melarang sumber skrip eksternal dan `object-src`

### Proteksi injeksi SQL

Skema PostgreSQL dirancang untuk query berparameter. Datastore default tidak menyusun SQL sama sekali sehingga permukaan serangan injeksi tidak ada pada konfigurasi bawaan.

### Header keamanan

Diterapkan di `src/middleware.ts` (setara Helmet) dan diperkuat lagi di Nginx:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:;
  connect-src 'self'; frame-ancestors 'none'; base-uri 'self';
  form-action 'self' https://wa.me; object-src 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
```

### Rate limiting

| Endpoint | Batas |
| --- | --- |
| `POST /api/auth/login` | 6 / 5 menit |
| `POST /api/orders` | 8 / menit |
| `POST /api/tickets` | 5 / 10 menit |
| `POST /api/coupons/validate` | 20 / menit |
| `GET` pencarian pelanggan | 20 / menit |
| `POST /api/admin/*` | 120 / menit |

Implementasi bawaan adalah fixed window dalam memori — cukup untuk satu instance. Untuk deployment multi-instance, ganti penyimpanan bucket di `src/lib/rate-limit.ts` dengan Redis (`REDIS_URL` sudah tersedia di compose stack) memakai `INCR` dengan `EXPIRE`.

### Audit log

Seluruh login, pembuatan pesanan, pembuatan tiket, serta setiap operasi tulis dan hapus di dashboard tercatat dengan aktor, aksi, target, dan waktu. Log dapat dicari dan menyegarkan otomatis di **Dashboard → Audit Log** (500 entri terbaru).

## Pengerasan DDoS

Mitigasi DDoS efektif memerlukan pertahanan berlapis. Repositori ini menyediakan konfigurasi untuk lapisan yang berada dalam kendali Anda.

### Lapisan 1 — Cloudflare (tepi)

1. Arahkan DNS ke Cloudflare dan aktifkan proxy (awan oranye) untuk record web
2. **SSL/TLS** → mode **Full (strict)**, aktifkan **Always Use HTTPS** dan **HSTS**
3. **Security** → aktifkan **Bot Fight Mode** dan **Managed Ruleset** (OWASP Core)
4. **Rate limiting rules:**

   | Path | Batas | Aksi |
   | --- | --- | --- |
   | `/api/auth/login` | 5 permintaan / menit per IP | Block 1 jam |
   | `/api/orders` | 10 permintaan / menit per IP | Managed Challenge |
   | `/api/*` | 60 permintaan / menit per IP | Managed Challenge |

5. **WAF custom rules** — blokir permintaan tanpa User-Agent dan permintaan ke path probe (`wp-admin`, `.env`, `.git`, `xmlrpc.php`)
6. Saat serangan aktif, nyalakan **Under Attack Mode**
7. Batasi firewall origin agar hanya menerima rentang IP Cloudflare (daftar di `https://www.cloudflare.com/ips-v4`)

### Lapisan 2 — Nginx (origin)

Terkonfigurasi di `nginx/nginx.conf` dan `nginx/wangstore.conf`:

- Zona `limit_req`: umum 30 r/s, API 10 r/s, login 1 r/s
- `limit_conn`: 24 koneksi per IP, 2000 per server
- Deteksi bot buruk melalui pemetaan User-Agent (scanner, scraper agresif, User-Agent kosong)
- Penolakan metode HTTP tidak sah
- Penolakan berkas tersembunyi dan path probe umum
- Timeout ketat (body, header, send masing-masing 12 detik) untuk menahan serangan Slowloris
- `set_real_ip_from` untuk seluruh rentang Cloudflare agar rate limiting bekerja pada IP pengunjung sebenarnya, bukan IP proxy

Terapkan pada bare-metal:

```bash
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/proxy-params.conf /etc/nginx/proxy-params.conf
sudo cp nginx/wangstore.conf /etc/nginx/conf.d/wangstore.conf
sudo nginx -t && sudo systemctl reload nginx
```

### Lapisan 3 — Fail2Ban (sistem operasi)

```bash
sudo cp nginx/fail2ban-wangstore.conf /etc/fail2ban/jail.d/wangstore.local
sudo cp nginx/filter-wangstore-login.conf /etc/fail2ban/filter.d/wangstore-login.conf
sudo cp nginx/filter-wangstore-probe.conf /etc/fail2ban/filter.d/wangstore-probe.conf
sudo systemctl restart fail2ban
sudo fail2ban-client status wangstore-login
```

Jail yang aktif: `sshd`, `nginx-http-auth`, `nginx-limit-req`, `nginx-badbots`, `wangstore-login` (brute force login), dan `wangstore-probe` (pemindai kerentanan).

### Lapisan 4 — Aplikasi

Rate limiting per endpoint, validasi ketat, batas ukuran payload, dan audit log seperti dijelaskan di atas.

### Batasan yang harus dipahami

Konfigurasi di repositori ini menangani abuse di lapisan aplikasi dan jaringan tepi (L7), serta sebagian besar serangan L4 berskala kecil hingga menengah. **Konfigurasi ini tidak dapat menghentikan serangan volumetrik yang melampaui kapasitas uplink server Anda.** Ketika 200 Gbps trafik tiba di tautan 10 Gbps, tautan tersebut jenuh sebelum satu paket pun mencapai Nginx.

Perlindungan volumetrik nyata hanya dapat diberikan oleh penyedia dengan kapasitas scrubbing upstream. Tidak ada penyedia atau skrip yang dapat menjanjikan kekebalan mutlak. Yang dapat dijanjikan secara jujur adalah kapasitas terukur, pemantauan, transparansi insiden, dan kredit SLA.

## Checklist Pengerasan Produksi

- [ ] Ganti kata sandi owner awal segera setelah instalasi
- [ ] Setel `AUTH_SECRET` unik hasil `openssl rand -base64 48`
- [ ] Setel `NEXT_PUBLIC_SITE_URL` ke domain produksi
- [ ] Aktifkan HTTPS dan verifikasi HSTS dengan `curl -I`
- [ ] Batasi firewall origin ke rentang IP Cloudflare
- [ ] Pasang dan verifikasi jail Fail2Ban
- [ ] Jadwalkan `scripts/backup.sh` via cron dan uji `restore.sh` minimal sekali
- [ ] Verifikasi izin berkas: `.env` dan arsip backup harus `600`
- [ ] Nonaktifkan login SSH berbasis kata sandi, gunakan kunci
- [ ] Aktifkan pembaruan keamanan otomatis pada sistem operasi
- [ ] Tinjau Audit Log secara berkala
- [ ] Pantau CI: Dependabot dan CodeQL berjalan otomatis
- [ ] Untuk multi-instance, pindahkan rate limiting ke Redis
