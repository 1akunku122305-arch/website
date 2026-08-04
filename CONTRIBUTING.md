# Berkontribusi ke WangStore

Terima kasih telah meluangkan waktu untuk berkontribusi. Dokumen ini menjelaskan standar dan alur kerja yang kami gunakan.

## Kode Etik

Bersikaplah profesional dan hormat. Diskusi teknis boleh tajam, serangan pribadi tidak.

## Menyiapkan Lingkungan

```bash
git clone https://github.com/hyunkk-ark/repo-website.git wangstore
cd wangstore
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`. Datastore melakukan seeding otomatis ke `data/wangstore.json`; hapus berkas tersebut untuk kembali ke data awal.

## Standar Kode

### Prinsip

- **SOLID** — satu modul satu tanggung jawab; modul dashboard bersifat generik dan dikonfigurasi lewat deklarasi, bukan digandakan
- **DRY** — logika harga, validasi, dan tipe dibagikan antara klien dan server. Jangan menggandakan aturan bisnis
- **KISS** — pilih solusi paling sederhana yang benar. Hindari abstraksi tanpa kebutuhan nyata

### Wajib

- **Type safety** — TypeScript strict. `any` tidak diterima; gunakan `unknown` dengan penyempitan tipe
- **Validasi** — setiap masukan pengguna melewati skema Zod di `src/lib/validation.ts`
- **Aksesibilitas** — kontrol interaktif harus dapat diakses keyboard, memiliki label, dan kontras memadai. Gunakan elemen semantik
- **Responsif** — mobile first; verifikasi pada 375 px, 768 px, dan 1440 px
- **Performa** — utamakan Server Component; tambahkan `"use client"` hanya bila benar-benar dibutuhkan
- **Komponen reusable** — primitif UI ada di `src/components/ui`. Perluas primitif tersebut alih-alih membuat varian sekali pakai

### Konten

Seluruh teks yang dilihat pengguna ditulis dalam Bahasa Indonesia dan harus konkret. Tidak ada teks placeholder, lorem ipsum, atau komentar `TODO` pada kode yang di-merge.

## Sebelum Mengirim Pull Request

```bash
npx tsc --noEmit    # typecheck harus bersih
npm run lint        # lint harus bersih
npm run build       # build harus berhasil
```

Uji juga secara manual alur yang Anda ubah, termasuk pada lebar layar mobile.

## Konvensi Commit

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(builder): tambahkan pilihan storage tier NVMe Gen5
fix(api): tolak kupon kedaluwarsa pada perhitungan ulang server
docs(security): jelaskan batasan mitigasi DDoS
chore(deps): perbarui Next.js ke 16.2.12
```

Awalan yang digunakan: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

## Alur Pull Request

1. Buat branch dari `main`
2. Lakukan perubahan beserta dokumentasi yang relevan
3. Perbarui `CHANGELOG.md` pada bagian `[Unreleased]` untuk perubahan yang terlihat pengguna
4. Pastikan seluruh pemeriksaan CI hijau
5. Isi template pull request selengkapnya, sertakan tangkapan layar untuk perubahan UI
6. Minta review dan tanggapi umpan balik

## Melaporkan Kerentanan Keamanan

**Jangan** membuka issue publik untuk kerentanan keamanan. Gunakan [GitHub Security Advisory](https://github.com/hyunkk-ark/repo-website/security/advisories/new) atau kirim email ke `halo@wangstore.id`. Kami menanggapi dalam 48 jam.

## Struktur Proyek

Lihat bagian [Struktur Proyek](README.md#struktur-proyek) pada README dan [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) untuk penjelasan lapisan aplikasi.
