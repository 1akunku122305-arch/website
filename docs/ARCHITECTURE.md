# Arsitektur WangStore

## Gambaran Umum

WangStore adalah aplikasi Next.js 16 App Router yang berjalan sebagai satu proses Node. Seluruh konten situs bersumber dari datastore yang dapat disunting lewat dashboard, sehingga tidak ada teks yang tertanam permanen di dalam kode komponen.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Klien (browser)                          │
│  Server Component (HTML) + Client Component (builder, forms)    │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
        Navigasi halaman                    fetch() ke /api
                │                                 │
┌───────────────▼─────────────────────────────────▼───────────────┐
│                    middleware.ts (Edge)                          │
│   Header keamanan (CSP, HSTS, …) + gating sesi /dashboard        │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
┌───────────────▼──────────────┐  ┌───────────────▼───────────────┐
│      Server Components       │  │        Route Handlers          │
│  read() → render HTML        │  │  Zod → RBAC → mutasi → audit   │
└───────────────┬──────────────┘  └───────────────┬───────────────┘
                │                                 │
        ┌───────▼─────────────────────────────────▼───────┐
        │              src/lib/db.ts                       │
        │   Datastore JSON dengan antrean tulis serial     │
        │   (setara: database/schema.sql di PostgreSQL)    │
        └──────────────────────────────────────────────────┘
```

## Lapisan Aplikasi

### 1. Presentasi — `src/app`, `src/components`

Halaman publik dirender sebagai Server Component dan membaca datastore langsung, tanpa lompatan HTTP internal. Client Component hanya dipakai bila memang diperlukan interaktivitas:

- `builder.tsx` — kalkulasi harga realtime dan formulir pemesanan
- `status-board.tsx` — polling status tiap 60 detik
- `blog-index.tsx` — pencarian dan filter di sisi klien
- `header.tsx`, `contact-form.tsx`, `login-form.tsx`, `account-portal.tsx`
- Seluruh modul dashboard

Primitif desain di `src/components/ui` (Button, ButtonLink, Card, Field, Badge, Meter, Stat, SectionHeading, Prose) menjaga konsistensi Neo-Brutalism: border hitam 3 px, sudut membulat besar, bayangan keras, dan animasi hover premium.

### 2. Domain — `src/lib/pricing.ts`

Modul ini adalah satu-satunya sumber kebenaran untuk harga dan estimasi kapasitas, dan diimpor oleh UI maupun API. Hal ini menjamin angka yang dilihat pelanggan identik dengan yang dihitung server.

**Model kapasitas** (`estimateMetrics`) memperhitungkan karakteristik masing-masing software:

| Software | Faktor RAM | Faktor TPS | Karakter |
| --- | --- | --- | --- |
| Paper | 1,00 | 1,15 | Optimasi plugin terbaik |
| Purpur | 1,02 | 1,14 | Paper + opsi gameplay |
| Fabric | 1,15 | 1,05 | Mod modern, ringan |
| Forge | 1,60 | 0,82 | Modpack besar, RAM tinggi |
| NeoForge | 1,50 | 0,88 | Penerus Forge |
| Vanilla | 1,10 | 0,90 | Tanpa optimasi |
| Velocity | 0,50 | 1,20 | Proxy modern |
| Waterfall | 0,60 | 1,10 | Proxy kompatibel BungeeCord |

Kapasitas pemain diambil dari nilai terkecil antara batas CPU dan batas RAM; TPS diturunkan dari headroom yang tersisa. Model bersifat deterministik sehingga hasilnya dapat direproduksi dan diuji.

### 3. Data — `src/lib/db.ts`

Datastore JSON dengan tiga sifat penting:

- **Serialisasi tulis** — setiap mutasi masuk antrean promise sehingga tidak ada kondisi balapan baca-ubah-tulis
- **Penulisan atomik** — tulis ke berkas sementara lalu `rename`, sehingga berkas tidak pernah setengah tertulis
- **Cache proses** — pembacaan dilayani dari memori setelah pemuatan pertama

Seeding otomatis dari `src/lib/seed.ts` pada permintaan pertama. `database/schema.sql` mencerminkan bentuk yang sama untuk deployment PostgreSQL.

**Alasan desain:** repositori harus bisa di-clone dan langsung berjalan tanpa memasang database. Untuk skala besar, tabel PostgreSQL sudah tersedia dan volume Docker menjaga persistensi.

### 4. Keamanan — `src/lib/auth.ts`, `validation.ts`, `rate-limit.ts`, `api.ts`, `middleware.ts`

Setiap route handler mengikuti pola yang sama:

```ts
assertSameOrigin(req);            // proteksi CSRF
const blocked = limited(req, …);  // rate limiting
const body = schema.parse(json);  // validasi + sanitasi Zod
await requireRole("ADMIN");       // RBAC (endpoint admin)
// … mutasi …
await audit(actor, action, target);
```

## Alur Data Kunci

### Pemesanan

1. Builder menghitung penawaran di klien untuk umpan balik instan
2. `POST /api/orders` memvalidasi payload dengan `orderSchema`
3. Konfigurasi dinormalisasi ulang (`normalizeConfig`) — nilai di luar batas dipangkas ke rentang sah
4. Region diverifikasi aktif, kupon dicari di datastore
5. **Harga dihitung ulang sepenuhnya di server** — harga dari klien diabaikan
6. Pesanan disimpan, pemakaian kupon dinaikkan, audit log ditulis
7. Pesan WhatsApp disusun dan tautan `wa.me` dikembalikan

### CMS

Endpoint `/api/admin/[resource]` bersifat generik. Setiap resource mendeklarasikan koleksi, field identitas, dan peran minimum:

```ts
posts: { key: "posts", idField: "slug", prefix: "post", write: "ADMIN" }
```

Menambah modul baru cukup dengan menambah satu entri di peta `RESOURCES` dan satu definisi field di shell dashboard — tidak perlu route handler baru. Inilah penerapan DRY pada lapisan CMS.

## Keputusan Desain

| Keputusan | Alasan |
| --- | --- |
| Datastore JSON sebagai default | Repositori langsung berjalan setelah clone; PostgreSQL tetap tersedia untuk skala |
| Logika harga dibagi klien-server | Mencegah perbedaan angka sekaligus manipulasi harga |
| Endpoint admin generik | Dua puluh modul tanpa dua puluh route handler duplikat |
| Server Component sebagai default | HTML lebih kecil, SEO lebih baik, JavaScript klien minimal |
| Font via stylesheet | Build tidak bergantung pada ketersediaan jaringan ke Google Fonts |
| Middleware untuk header | Satu tempat untuk CSP dan HSTS, berlaku pada semua respons |
