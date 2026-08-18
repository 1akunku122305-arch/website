import type { DataStore } from './types';
import { generateId } from '@/lib/utils';

/**
 * Seeds all CMS/content collections. Only runs when empty (idempotent).
 * Content is real and maintainable from the admin CMS.
 */

function nowIso(): string {
  return new Date().toISOString();
}

async function seedIfEmpty(store: DataStore, collection: any, rows: Array<Record<string, unknown>>) {
  if ((await store.count(collection)) > 0) return;
  for (const row of rows) {
    await store.create(collection, { id: String(row.id) || generateId(), ...row } as never);
  }
}

const ts = () => nowIso();

const pages = [
  {
    id: 'page_home',
    key: 'home',
    title: 'WangStore',
    slug: '/',
    content: `# WangStore — Build Your Own Server.

WangStore adalah platform untuk membeli layanan hosting dan mengelola akun Anda dalam satu tempat. Pilih layanan, konfigurasi sesuai kebutuhan, dan kelola semuanya dari dashboard.

## Layanan kami
- **Minecraft Hosting** — jalankan server Minecraft komunitas Anda.
- **VPS** — server virtual dengan kendali penuh.
- **Dedicated Server** — server khusus untuk beban kerja berat.
- **Panel Hosting** — kelola server Anda dengan mudah.

## Cara kerja
1. Pilih layanan.
2. Gunakan Server Builder untuk mengonfigurasi kebutuhan Anda.
3. Isi informasi pemesanan.
4. Hubungi kami melalui WhatsApp untuk menyelesaikan pemesanan.
5. Kelola layanan Anda dari dashboard pelanggan.`,
    seoTitle: 'WangStore — Build Your Own Server.',
    seoDescription: 'WangStore adalah platform penjualan layanan hosting. Konfigurasi server, lihat harga real-time, dan kelola layanan Anda.',
    updatedAt: ts(),
  },
  {
    id: 'page_about',
    key: 'about',
    title: 'Tentang WangStore',
    slug: 'about',
    content: `# Tentang WangStore

## Cerita
WangStore dimulai dari kebutuhan sederhana: membeli dan mengelola layanan hosting seharusnya mudah, jelas, dan transparan. Kami membangun platform ini sebagai pusat penjualan dan pengelolaan layanan hosting yang terpercaya.

## Visi
Menjadi platform terpercaya bagi komunitas Minecraft, developer, creator, dan bisnis kecil untuk mendapatkan layanan hosting dengan proses yang jelas dan harga yang transparan.

## Misi
- Menyediakan proses pemesanan yang sederhana dan transparan.
- Menjaga kejujuran informasi layanan dan infrastruktur.
- Memberikan dukungan melalui kanal yang benar-benar tersedia.

## Prinsip
- **Transparansi** — tidak ada klaim palsu tentang hardware, uptime, atau statistik.
- **Kesederhanaan** — proses yang mudah dipahami.
- **Kejujuran** — jika belum tersedia, kami katakan belum tersedia.

## Teknologi Platform
WangStore dibangun dengan Next.js, TypeScript, dan Tailwind CSS, serta dirancang untuk berjalan di lingkungan serverless.`,
    seoTitle: 'Tentang WangStore',
    seoDescription: 'Kenali cerita, visi, misi, dan prinsip di balik WangStore.',
    updatedAt: ts(),
  },
  {
    id: 'page_features',
    key: 'features',
    title: 'Fitur',
    slug: 'features',
    content: `# Fitur WangStore

- **Server Builder** — konfigurasi server dengan harga real-time.
- **Transparansi Harga** — harga dihitung server-side, tidak ada biaya tersembunyi.
- **Dashboard Pelanggan** — kelola pesanan, layanan, dan profil.
- **Knowledge Base** — panduan dan tutorial untuk membantu Anda.
- **Status Layanan** — pantau status platform dan layanan.
- **Dukungan** — melalui WhatsApp, Discord, email, dan tiket.`,
    seoTitle: 'Fitur WangStore',
    seoDescription: 'Fitur-fitur WangStore untuk membeli dan mengelola layanan hosting.',
    updatedAt: ts(),
  },
  {
    id: 'page_why',
    key: 'why-wangstore',
    title: 'Mengapa WangStore',
    slug: 'why-wangstore',
    content: `# Mengapa Memilih WangStore

- **Proses yang jelas** — dari konfigurasi hingga pemesanan, setiap langkah jelas.
- **Harga transparan** — harga dihitung otomatis dan final.
- **Tanpa janji palsu** — kami hanya menampilkan informasi yang benar.
- **Portal pelanggan** — kelola layanan Anda dalam satu dashboard.
- **Konsultasi pra-pembelian** — hubungi kami jika ragu sebelum membeli.`,
    seoTitle: 'Mengapa WangStore',
    seoDescription: 'Alasan memilih WangStore untuk kebutuhan hosting Anda.',
    updatedAt: ts(),
  },
  {
    id: 'page_infrastructure',
    key: 'infrastructure',
    title: 'Infrastruktur',
    slug: 'infrastructure',
    content: `# Infrastruktur

**WangStore adalah platform penjualan dan pengelolaan layanan hosting.**

WangStore tidak menjalankan infrastruktur hosting pelanggan (seperti server game, VPS, atau dedicated) di dalam aplikasi itu sendiri. Aplikasi hanya menangani katalog layanan, pemesanan, akun, dan dashboard administrasi.

Informasi mengenai hardware, lokasi server, dan infrastruktur fisik yang mendukung layanan pelanggan akan disediakan oleh penyedia layanan yang relevan.

> Informasi infrastruktur sedang diperbarui.`,
    seoTitle: 'Infrastruktur WangStore',
    seoDescription: 'Kejujuran mengenai infrastruktur WangStore.',
    updatedAt: ts(),
  },
  {
    id: 'page_contact',
    key: 'contact',
    title: 'Kontak',
    slug: 'contact',
    content: `# Hubungi Kami

Gunakan kanal di bawah untuk menghubungi WangStore. Kanal yang tersedia dikonfigurasi oleh tim WangStore.

- **WhatsApp** — untuk pertanyaan cepat dan konsultasi.
- **Discord** — untuk diskusi komunitas.
- **Email** — untuk korespondensi formal.
- **Tiket** — untuk dukungan yang terdokumentasi.`,
    seoTitle: 'Kontak WangStore',
    seoDescription: 'Hubungi WangStore melalui WhatsApp, Discord, email, atau tiket.',
    updatedAt: ts(),
  },
];

const legalDocuments = [
  {
    id: 'legal_terms', slug: 'terms', title: 'Syarat & Ketentuan',
    content: `# Syarat & Ketentuan

## Penerimaan
Dengan menggunakan WangStore, Anda menyetujui syarat dan ketentuan ini.

## Layanan
WangStore adalah platform penjualan dan pengelolaan layanan hosting. Layanan infrastruktur dijalankan oleh penyedia terkait.

## Akun
Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda dan seluruh aktivitas yang terjadi pada akun Anda.

## Pembelian
Semua pembelian bersifat final sesuai kebijakan WangStore. Pastikan konfigurasi Anda sudah benar sebelum melakukan pembayaran.

## Larangan Penyalahgunaan
Dilarang menggunakan layanan untuk aktivitas ilegal, penyalahgunaan, atau yang melanggar hukum yang berlaku.

## Perubahan
WangStore dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui kanal resmi.`,
    seoTitle: 'Syarat & Ketentuan WangStore', seoDescription: 'Syarat dan ketentuan penggunaan WangStore.', updatedAt: ts(),
  },
  {
    id: 'legal_privacy', slug: 'privacy', title: 'Kebijakan Privasi',
    content: `# Kebijakan Privasi

## Data yang Dikumpulkan
WangStore mengumpulkan data yang Anda berikan saat mendaftar, memesan, atau menghubungi kami, seperti nama, email, nomor WhatsApp, dan data konfigurasi layanan.

## Penggunaan Data
Data digunakan untuk memproses pesanan, mengelola akun, memberikan dukungan, dan memenuhi kewajiban hukum.

## Keamanan
Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda, termasuk enkripsi kata sandi dan kontrol akses.

## Hak Anda
Anda dapat meminta akses, koreksi, atau penghapusan data pribadi Anda sesuai peraturan yang berlaku.`,
    seoTitle: 'Kebijakan Privasi WangStore', seoDescription: 'Bagaimana WangStore mengelola data pribadi Anda.', updatedAt: ts(),
  },
  {
    id: 'legal_refund', slug: 'refund', title: 'Kebijakan Pengembalian Dana',
    content: `# Kebijakan Pengembalian Dana

## Sifat Pembelian
Semua pembelian di WangStore bersifat final. Kami tidak menyediakan uang kembali (refund) untuk alasan berikut:

- Salah spesifikasi atau salah memilih paket.
- Berubah pikiran.
- Proyek dibatalkan.
- Kurang memahami pengelolaan server.
- Layanan tidak digunakan.
- Kelalaian pelanggan atau pelanggaran kebijakan.

## Kompensasi
Kompensasi hanya diberikan jika kesalahan terbukti berasal dari WangStore. Bentuk kompensasi default adalah **kredit layanan**.

Pengembalian dana tunai hanya dimungkinkan jika layanan sama sekali tidak dapat disediakan oleh WangStore.

## Konsultasi
Jika ragu, konsultasikan terlebih dahulu sebelum melakukan pembelian melalui kanal yang tersedia.`,
    seoTitle: 'Kebijakan Pengembalian Dana WangStore', seoDescription: 'Kebijakan pengembalian dana WangStore.', updatedAt: ts(),
  },
  {
    id: 'legal_sla', slug: 'sla', title: 'Service Level Agreement',
    content: `# Service Level Agreement (SLA)

## Target Uptime
Target ketersediaan layanan adalah **99,9%**.

## Kredit Layanan
Berdasarkan uptime aktual dalam satu bulan:

- **99,0% – 99,89%** → kredit 10%
- **95,0% – 98,99%** → kredit 25%
- **Di bawah 95%** → kredit 50%

## Waktu Respons Support
- **Kritis** → 15 menit
- **Tinggi** → 1 jam
- **Normal** → 4 jam
- **Rendah** → 12 jam

Kompensasi berbentuk kredit layanan dan tidak dapat diuangkan.`,
    seoTitle: 'Service Level Agreement WangStore', seoDescription: 'SLA dan target uptime WangStore.', updatedAt: ts(),
  },
  {
    id: 'legal_aup', slug: 'acceptable-use', title: 'Kebijakan Penggunaan yang Dapat Diterima',
    content: `# Kebijakan Penggunaan yang Dapat Diterima

## Penggunaan yang Dilarang
- Aktivitas ilegal sesuai hukum yang berlaku.
- Distribusi malware, phishing, atau penipuan.
- Serangan terhadap sistem lain tanpa izin.
- Penyalahgunaan sumber daya yang mengganggu layanan lain.

## Penegakan
Pelanggaran dapat mengakibatkan penangguhan atau penghentian layanan.

## Perlindungan DDoS
Perlindungan DDoS bergantung pada kapasitas dan kemampuan provider jaringan. WangStore tidak menjanjikan perlindungan DDoS tanpa batas.`,
    seoTitle: 'Kebijakan Penggunaan yang Dapat Diterima WangStore', seoDescription: 'Kebijakan penggunaan yang dapat diterima di WangStore.', updatedAt: ts(),
  },
  {
    id: 'legal_cookies', slug: 'cookie-policy', title: 'Kebijakan Cookie',
    content: `# Kebijakan Cookie

## Apa itu Cookie
Cookie adalah file kecil yang disimpan di perangkat Anda untuk membantu situs bekerja dengan baik.

## Cookie yang Kami Gunakan
- **Cookie sesi** — untuk menjaga Anda tetap masuk.
- **Cookie preferensi** — menyimpan preferensi tampilan.

## Pengelolaan Cookie
Anda dapat menghapus atau memblokir cookie melalui pengaturan peramban Anda.`,
    seoTitle: 'Kebijakan Cookie WangStore', seoDescription: 'Kebijakan cookie WangStore.', updatedAt: ts(),
  },
];

const faqItems = [
  {
    id: 'faq_1', category: 'Umum', order: 1,
    question: 'Apa itu WangStore?',
    answer: 'WangStore adalah platform penjualan dan pengelolaan layanan hosting. Anda dapat memilih layanan, mengonfigurasi kebutuhan melalui Server Builder, dan mengelola akun dari dashboard.',
    published: true,
  },
  {
    id: 'faq_2', category: 'Umum', order: 2,
    question: 'Apakah WangStore menjalankan server Minecraft?',
    answer: 'Tidak. WangStore adalah platform penjualan dan pengelolaan layanan. Infrastruktur hosting pelanggan dijalankan oleh penyedia layanan terkait, di luar aplikasi ini.',
    published: true,
  },
  {
    id: 'faq_3', category: 'Pemesanan', order: 3,
    question: 'Bagaimana cara memesan?',
    answer: 'Gunakan Server Builder untuk memilih tier dan konfigurasi, lalu isi informasi pemesanan. Setelah order dibuat, Anda akan diarahkan ke WhatsApp untuk menyelesaikan pemesanan.',
    published: true,
  },
  {
    id: 'faq_4', category: 'Pemesanan', order: 4,
    question: 'Apakah harga yang ditampilkan sudah final?',
    answer: 'Ya. Harga dihitung oleh server dan bersifat final. Tidak ada biaya tambahan yang tersembunyi.',
    published: true,
  },
  {
    id: 'faq_5', category: 'Pembayaran', order: 5,
    question: 'Apakah ada refund?',
    answer: 'Semua pembelian bersifat final. Kompensasi hanya diberikan jika kesalahan terbukti berasal dari WangStore, dalam bentuk kredit layanan.',
    published: true,
  },
  {
    id: 'faq_6', category: 'Pembayaran', order: 6,
    question: 'Kapan layanan saya aktif?',
    answer: 'Layanan aktif sesuai waktu aktivasi yang ditentukan. Jika waktu aktivasi berada di masa depan, status layanan adalah "scheduled" dan menjadi "active" saat waktu aktivasi tercapai.',
    published: true,
  },
  {
    id: 'faq_7', category: 'Layanan', order: 7,
    question: 'Apakah layanan dapat diperpanjang?',
    answer: 'Layanan dapat diperpanjang jika produk/penetapan layanan menandai renewable = aktif. Jika tidak, tombol perpanjangan tidak tersedia.',
    published: true,
  },
];

const blogCategories = [
  { id: 'blogcat_1', name: 'Panduan', slug: 'panduan' },
  { id: 'blogcat_2', name: 'Tips', slug: 'tips' },
  { id: 'blogcat_3', name: 'Pengumuman', slug: 'pengumuman' },
];

const blogPosts = [
  {
    id: 'blog_1', title: 'Cara Memilih Spesifikasi Server untuk Komunitas Minecraft', slug: 'cara-memilih-spesifikasi-server-minecraft',
    excerpt: 'Panduan sederhana memilih CPU, RAM, dan penyimpanan untuk server Minecraft komunitas Anda.',
    content: `# Cara Memilih Spesifikasi Server untuk Komunitas Minecraft

Memilih spesifikasi server adalah langkah penting. Berikut panduan sederhananya.

## CPU
Semakin banyak core, semakin baik kemampuan server memproses tugas. Untuk komunitas kecil, 2-4 core sudah cukup.

## RAM
RAM menentukan seberapa banyak pemain dan plugin yang dapat ditampung. Mulai dari 4 GB untuk komunitas kecil.

## Penyimpanan
Gunakan penyimpanan yang cukup untuk dunia dan backup. Mulai dari 20 GB.

## Gunakan Server Builder
Gunakan **Server Builder** di WangStore untuk melihat estimasi harga real-time sesuai konfigurasi Anda.`,
    categoryId: 'blogcat_1', tags: ['panduan', 'minecraft'], author: 'Tim WangStore',
    status: 'published', publishedAt: ts(), createdAt: ts(), updatedAt: ts(), featured: true,
  },
  {
    id: 'blog_2', title: 'Memahami Status Pesanan dan Status Layanan', slug: 'memahami-status-pesanan-dan-layanan',
    excerpt: 'Perbedaan antara status pesanan dan status layanan, dan apa artinya untuk Anda.',
    content: `# Memahami Status Pesanan dan Status Layanan

Status pesanan dan status layanan adalah dua hal yang berbeda.

## Status Pesanan
- **pending** — pesanan dibuat.
- **awaiting_payment** — menunggu pembayaran.
- **paid** — pembayaran diterima.
- **processing** — sedang diproses.
- **completed** — selesai.
- **cancelled / expired / refunded** — pesanan tidak dilanjutkan.

## Status Layanan
- **scheduled** — waktu aktivasi di masa depan.
- **active** — layanan aktif.
- **expired** — masa layanan telah berakhir.
- **suspended / cancelled / terminated** — layanan dihentikan.

## Sumber Kebenaran
Waktu server adalah sumber kebenaran untuk aktivasi dan kedaluwarsa layanan.`,
    categoryId: 'blogcat_2', tags: ['status', 'layanan'], author: 'Tim WangStore',
    status: 'published', publishedAt: ts(), createdAt: ts(), updatedAt: ts(), featured: false,
  },
];

const knowledgeArticles = [
  {
    id: 'kb_1', title: 'Memulai Menggunakan WangStore', slug: 'memulai-wangstore',
    excerpt: 'Langkah awal menggunakan WangStore untuk membeli layanan.',
    content: `# Memulai Menggunakan WangStore

1. **Buka** halaman utama WangStore.
2. **Pilih layanan** yang Anda butuhkan.
3. Gunakan **Server Builder** untuk konfigurasi.
4. Isi informasi pemesanan dan buat order.
5. Selesaikan pemesanan melalui WhatsApp.
6. Kelola layanan dari dashboard.`,
    category: 'Memulai', tags: ['memulai'], status: 'published', createdAt: ts(), updatedAt: ts(),
  },
  {
    id: 'kb_2', title: 'Cara Membuat Order di Server Builder', slug: 'cara-membuat-order',
    excerpt: 'Panduan lengkap membuat order melalui Server Builder.',
    content: `# Cara Membuat Order di Server Builder

## Pilih Tier
Pilih antara Low, Medium, atau High.

## Konfigurasi (Low)
Atur CPU, RAM, dan penyimpanan menggunakan slider.

## Paket Tetap (High)
Pilih salah satu paket tetap yang tersedia.

## Medium
Tier Medium sedang dipersiapkan dan belum dapat dipesan.

## Isi Informasi
Masukkan nama, WhatsApp, email, dan nama server.

## Buat Order
Klik "Pesan Sekarang". Harga dihitung server-side. Anda akan diarahkan ke WhatsApp.`,
    category: 'Pemesanan', tags: ['pemesanan', 'builder'], status: 'published', createdAt: ts(), updatedAt: ts(),
  },
  {
    id: 'kb_3', title: 'Memahami Proses Pembayaran', slug: 'proses-pembayaran',
    excerpt: 'Bagaimana pembayaran diproses setelah membuat order.',
    content: `# Memahami Proses Pembayaran

Setelah membuat order, Anda akan diarahkan ke WhatsApp dengan ringkasan pesanan.

Pembayaran diproses melalui kanal yang dikonfigurasi WangStore. Pastikan Anda memverifikasi detail pesanan sebelum menyelesaikan pembayaran.

Semua pembelian bersifat final sesuai kebijakan WangStore. Jika ragu, konsultasikan terlebih dahulu.`,
    category: 'Pembayaran', tags: ['pembayaran'], status: 'published', createdAt: ts(), updatedAt: ts(),
  },
  {
    id: 'kb_4', title: 'Panduan Memperpanjang Layanan', slug: 'memperpanjang-layanan',
    excerpt: 'Cara memperpanjang layanan yang renewable.',
    content: `# Panduan Memperpanjang Layanan

Jika layanan Anda menandai "Perpanjang Layanan", Anda dapat memperpanjang dari dashboard.

- Layanan **active**: masa layanan diperpanjang dari tanggal kedaluwarsa saat ini.
- Layanan **expired**: masa baru dimulai dari waktu server saat perpanjangan.

Jika layanan tidak dapat diperpanjang, tombol perpanjangan tidak ditampilkan.`,
    category: 'Akun', tags: ['perpanjangan', 'layanan'], status: 'published', createdAt: ts(), updatedAt: ts(),
  },
  {
    id: 'kb_5', title: 'Troubleshooting: Mengapa Harga Tidak Berubah', slug: 'troubleshooting-harga',
    excerpt: 'Solusi saat harga tidak berubah pada Server Builder.',
    content: `# Troubleshooting: Harga Tidak Berubah

## Penyebab
- Anda berada di tier **Medium** yang sedang dalam status ongoing.
- Nilai konfigurasi sudah berada pada batas minimum atau maksimum.

## Solusi
- Pastikan memilih tier **Low** atau **High**.
- Periksa nilai CPU, RAM, dan penyimpanan.

Harga dihitung server-side dan ditampilkan secara real-time.`,
    category: 'Troubleshooting', tags: ['troubleshooting', 'harga'], status: 'published', createdAt: ts(), updatedAt: ts(),
  },
];

const testimonials: Array<Record<string, unknown>> = []; // intentionally empty — no fake testimonials.

const announcements: Array<Record<string, unknown>> = [];

/**
 * Seed CMS content collections.
 */
export async function seedContent(store: DataStore): Promise<void> {
  await seedIfEmpty(store, 'pages', pages);
  await seedIfEmpty(store, 'legalDocuments', legalDocuments);
  await seedIfEmpty(store, 'faqItems', faqItems);
  await seedIfEmpty(store, 'blogCategories', blogCategories);
  await seedIfEmpty(store, 'blogPosts', blogPosts);
  await seedIfEmpty(store, 'knowledgeArticles', knowledgeArticles);
  await seedIfEmpty(store, 'testimonials', testimonials);
  await seedIfEmpty(store, 'announcements', announcements);
}
