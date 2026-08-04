# Referensi API WangStore

Seluruh endpoint mengembalikan JSON dengan bentuk konsisten:

```json
{ "ok": true,  "data": { } }
{ "ok": false, "error": "Pesan kesalahan dalam Bahasa Indonesia." }
```

Permintaan yang mengubah state wajib mengirim `Content-Type: application/json` dan header `Origin` yang sama dengan host (proteksi CSRF). Batas ukuran payload adalah 100 KB.

## Publik

### `GET /api/health`

Probe liveness dan readiness. Dipakai oleh `install.sh`, healthcheck Docker, dan CI.

```json
{ "ok": true, "data": { "status": "healthy", "version": "1.0.0", "uptimeSeconds": 128,
  "datastore": { "nodes": 6, "posts": 4, "orders": 0 }, "timestamp": "2026-07-25T10:00:00.000Z" } }
```

### `GET /api/status`

Status agregat armada beserta seluruh insiden.

```json
{ "ok": true, "data": { "overall": "MAINTENANCE", "operational": 5, "total": 6,
  "averageUptime": 99.95, "nodes": [], "incidents": [], "checkedAt": "…" } }
```

`overall` bernilai `OPERATIONAL`, `MAINTENANCE`, `DEGRADED`, atau `MAJOR_OUTAGE`.

### `POST /api/orders`

Batas laju: 8 permintaan per menit per IP.

```bash
curl -X POST https://wangstore.id/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Budi Santoso",
    "whatsapp": "081200000001",
    "email": "budi@example.com",
    "serverName": "SkyRealm SMP",
    "notes": "Butuh bantuan migrasi dunia",
    "coupon": "WANG10",
    "config": {
      "cpu": 4, "ram": 8, "ssd": 40, "nvme": 0, "hdd": 0, "bandwidth": 5,
      "os": "Ubuntu 24.04 LTS", "java": "Java 21", "mcVersion": "1.21.4",
      "software": "paper", "panel": "pterodactyl", "region": "id",
      "dedicatedIp": false, "extraPorts": 0, "backup": true,
      "prioritySupport": false, "ddosAdvanced": false, "billingCycle": "monthly"
    }
  }'
```

```json
{ "ok": true, "data": { "orderId": "ord_…", "total": 113400,
  "whatsappUrl": "https://wa.me/6281200000000?text=…", "couponError": null } }
```

Harga selalu dihitung ulang di server. Nilai harga apa pun yang dikirim klien diabaikan.

Kode kesalahan: `422` validasi gagal atau region tidak tersedia · `429` batas laju terlampaui · `503` mode maintenance aktif.

### `GET /api/orders?email=<email>`

Mengembalikan pesanan milik alamat email tersebut. Batas laju 20 per menit. Bila terdapat sesi admin aktif, seluruh pesanan dikembalikan.

### `POST /api/coupons/validate`

Batas laju 20 per menit.

```json
{ "code": "WANG10", "subtotal": 100000 }
```

```json
{ "ok": true, "data": { "coupon": { "code": "WANG10", "type": "PERCENT", "value": 10, … }, "discount": 10000 } }
```

Kode kesalahan: `404` kupon tidak ditemukan atau nonaktif · `410` kedaluwarsa atau kuota habis.

### `POST /api/tickets`

Batas laju 5 per 10 menit.

```json
{ "name": "Budi", "email": "budi@example.com", "subject": "Migrasi server", "message": "…" }
```

```json
{ "ok": true, "data": { "ticketId": "tkt_…" } }
```

### `GET /api/tickets?email=<email>`

Tiket milik alamat email tersebut. Batas laju 20 per menit.

## Autentikasi

### `POST /api/auth/login`

Batas laju 6 per 5 menit per IP. Upaya berhasil maupun gagal dicatat di audit log.

```json
{ "email": "owner@wangstore.id", "password": "…" }
```

Menetapkan cookie sesi `wangstore_session` (HttpOnly, SameSite=Lax, Secure di produksi, kedaluwarsa 8 jam) dan cookie CSRF `wangstore_csrf`.

```json
{ "ok": true, "data": { "name": "Wang Owner", "role": "OWNER" } }
```

### `POST /api/auth/logout`

Menghapus kedua cookie dan mencatat audit log.

## Admin

Seluruh endpoint admin memerlukan sesi aktif. Peran diverifikasi ulang di server pada setiap permintaan; tanpa izin, respons adalah `403`.

### `GET /api/admin/:resource`

Peran minimum: **Staff**.

Resource: `orders`, `tickets`, `coupons`, `posts`, `articles`, `faqs`, `nodes`, `regions`, `incidents`, `announcements`, `testimonials`.

Resource khusus:

- `settings` → `{ settings, priceFormula }`
- `audit` → 500 entri audit terbaru
- `analytics` → agregat pesanan, pendapatan, pelanggan, dan tiket

```json
{ "ok": true, "data": { "items": [] } }
```

### `POST /api/admin/:resource`

Peran minimum bergantung resource: `orders` dan `tickets` **Staff**, sisanya **Admin**. Batas laju 120 per menit.

Operasi bersifat upsert: bila entri dengan field identitas yang sama ada, entri diperbarui; bila tidak, entri dibuat.

```json
{ "item": { "code": "WANG15", "type": "PERCENT", "value": 15, "active": true,
            "maxUses": 100, "uses": 0, "expiresAt": null, "description": "Diskon 15%" } }
```

```json
{ "ok": true, "data": { "id": "WANG15", "action": "CREATED" } }
```

Untuk `settings`, kirim `{ "item": { "settings": {...} } }` atau `{ "item": { "priceFormula": {...} } }`.

Seluruh string pada payload disanitasi secara rekursif: tag HTML dan karakter kontrol dihapus, panjang dibatasi.

### `DELETE /api/admin/:resource?id=<identitas>`

Peran minimum: **Admin**. Mengembalikan `404` bila entri tidak ditemukan.

```json
{ "ok": true, "data": { "deleted": "WANG15" } }
```
