# Changelog

Seluruh perubahan penting pada proyek ini dicatat di berkas ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/),
dan proyek ini menganut [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

## [1.0.0] — 2026-07-25

Rilis produksi pertama platform hosting WangStore.

### Ditambahkan

#### Halaman publik
- Beranda dengan hero animasi, maskot, marquee teknologi, layanan, keunggulan, region, alur pemesanan, testimoni, blog, FAQ, dan CTA
- Halaman Tentang berisi cerita perusahaan, visi, misi, alasan memilih, infrastruktur, tim, dan teknologi
- Halaman Infrastruktur dengan enam pilar teknis dan tabel spesifikasi seluruh node
- Halaman Fitur berisi 16 kemampuan dalam empat kelompok serta tabel perbandingan
- Halaman Kenapa WangStore dengan enam pilar dan metrik utama
- FAQ terkelompok per kategori dengan structured data `FAQPage`
- Halaman Testimoni beserta ringkasan rating
- Blog dengan Markdown, kategori, tag, pencarian lintas isi, artikel terkait, dan `BlogPosting` JSON-LD
- Knowledge Base dengan artikel per kategori dan `TechArticle` JSON-LD
- Status page: uptime node, status region, pemeliharaan terjadwal, kronologi insiden, penyegaran otomatis 60 detik
- Halaman Kontak dengan lima kanal komunikasi dan formulir tiket
- Enam dokumen legal (Terms, Privacy, Refund, SLA, Acceptable Use, Cookie) yang seluruhnya dapat disunting dari CMS
- Halaman 404 khusus

#### Server Builder
- Konfigurasi bebas tanpa paket: CPU, RAM, SSD, NVMe, HDD, bandwidth, OS, Java, versi Minecraft, software, panel, region, dan add-on
- Delapan server software: Paper, Purpur, Fabric, Forge, NeoForge, Vanilla, Velocity, Waterfall
- Estimasi realtime: harga bulanan, TPS, jumlah pemain, beban CPU, pemakaian RAM, rekomendasi plugin, grade build
- Siklus penagihan bulanan, 3 bulan (−5%), dan 12 bulan (−15%)
- Validasi kupon langsung terhadap server
- Penyimpanan konfigurasi di perangkat dan pemulihan otomatis
- Konfigurasi minimum 2 Core / 4 GB / 20 GB SSD seharga Rp45.000 per bulan

#### Alur pemesanan
- Formulir pemesanan dengan validasi klien dan server
- Perhitungan ulang harga di sisi server sehingga manipulasi klien tidak berpengaruh
- Pembuatan pesan WhatsApp terformat dan pengalihan ke `wa.me`
- Halaman konfirmasi pesanan berisi rincian lengkap
- Fallback ke WhatsApp bila API tidak terjangkau

#### Admin panel
- Login aman dengan sesi JWT dan tiga peran: Owner, Admin, Staff
- 20 modul dashboard mencakup pesanan, pelanggan, tiket, formula harga, kupon, analitik, blog, knowledge base, FAQ, testimoni, halaman & legal, infrastruktur, lokasi server, insiden, pengumuman, tema, sosial & kontak, maintenance, dan audit log
- Endpoint CMS generik dengan kontrol peran per resource
- Editor tema: logo, favicon, maskot, judul, hero, footer, warna merek
- Editor formula harga dengan pratinjau harga minimum langsung

#### Portal pelanggan
- Riwayat pesanan, tiket dukungan beserta balasan, konfigurasi tersimpan, dan kontak cepat

#### API
- `/api/health`, `/api/status`, `/api/orders`, `/api/coupons/validate`, `/api/tickets`, `/api/auth/login`, `/api/auth/logout`, `/api/admin/:resource`

#### Keamanan
- Sesi JWT HttpOnly, hashing bcrypt cost 12, RBAC bertingkat
- Proteksi CSRF melalui pemeriksaan Origin dan cookie double-submit
- Sanitasi masukan rekursif, validasi Zod di setiap endpoint, batas payload
- CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP
- Rate limiting per IP di aplikasi dan di Nginx
- Audit log untuk login serta seluruh operasi tulis dan hapus
- Struktur siap 2FA pada skema database

#### Infrastruktur
- Dockerfile multi-stage dengan pengguna non-root, tini, dan healthcheck
- Compose stack: aplikasi, PostgreSQL 16, Redis 7, Nginx
- Skema PostgreSQL lengkap dengan enum, indeks, dan constraint
- Konfigurasi Nginx dengan rate limiting, connection limiting, deteksi bot, TLS, dan header keamanan
- Konfigurasi Fail2Ban beserta dua filter khusus WangStore
- PM2 cluster mode untuk deployment bare-metal

#### Skrip operasional
- `install.sh` — instalasi satu perintah dengan deteksi platform, Docker/bare-metal, SSL, migrasi, dan health check
- `update.sh` — pembaruan aman dengan backup dan rollback otomatis
- `backup.sh` — arsip datastore, uploads, environment, dan dump PostgreSQL dengan retensi
- `restore.sh` — pemulihan dengan snapshot pra-restore

#### SEO
- `sitemap.xml` dinamis, `robots.txt`, canonical URL, OpenGraph, Twitter Cards, dan structured data Organization, FAQPage, BlogPosting, TechArticle, ContactPage

#### Rekayasa
- GitHub Actions: typecheck, lint, build, smoke test, ShellCheck, audit dependensi, CodeQL, dan build image Docker
- Issue template, pull request template, dan konfigurasi Dependabot
- Dokumentasi arsitektur, deployment, keamanan, dan API

[Unreleased]: https://github.com/hyunkk-ark/repo-website/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/hyunkk-ark/repo-website/releases/tag/v1.0.0
