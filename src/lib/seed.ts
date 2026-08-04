import type { Database } from "./types";

const now = "2026-01-12T09:00:00.000Z";

export function seedDatabase(): Database {
  return {
    // Password for both accounts: WangStore#2026  (change immediately after install)
    users: [
      {
        id: "usr_owner",
        email: "owner@wangstore.id",
        name: "Wang Owner",
        role: "OWNER",
        passwordHash: "$2b$10$EsxJjNC0.Jh56gdjlpcdC.tBl2KUdC4X9bS9Y9djuSXXo4tthhqT6",
        createdAt: now,
      },
    ],
    settings: {
      siteTitle: "WangStore",
      tagline: "Build Your Own Server.",
      description:
        "WangStore adalah platform hosting game & cloud Indonesia: Minecraft Hosting, VPS, Dedicated Server, dan Panel Hosting dengan konfigurasi bebas, anti-DDoS, dan dukungan 24/7.",
      logo: "/brand/logo.svg",
      favicon: "/favicon.svg",
      mascot: "/brand/mascot.svg",
      heroTitle: "Build Your Own Server.",
      heroSubtitle:
        "Tanpa paket kaku. Racik CPU, RAM, NVMe, region, dan panel sesuai kebutuhan komunitasmu — harga dihitung realtime, server aktif dalam hitungan menit.",
      heroBadge: "Anti-DDoS • NVMe Gen4 • Uptime 99.9%",
      footerText:
        "WangStore — infrastruktur hosting untuk kreator, komunitas, dan developer Indonesia.",
      maintenance: false,
      maintenanceMessage:
        "WangStore sedang melakukan pemeliharaan terjadwal. Kami segera kembali.",
      theme: { brand: "#a855f7", brand2: "#7c3aed", brand3: "#d946ef", accent: "#22d3ee" },
      contact: {
        email: "halo@wangstore.id",
        phone: "+62 812-0000-0000",
        address: "Jl. Cyber Park No. 21, Jakarta Selatan, Indonesia",
        hours: "Support 24/7 — respon rata-rata di bawah 10 menit",
      },
      social: {
        whatsapp: "6281200000000",
        whatsappGroup: "https://chat.whatsapp.com/wangstore",
        discord: "https://discord.gg/wangstore",
        telegram: "https://t.me/wangstore",
        tiktok: "https://tiktok.com/@wangstore",
        github: "https://github.com/wangstore",
        instagram: "https://instagram.com/wangstore",
      },
      legal: {
        terms: {
          title: "Terms of Service",
          updatedAt: "2026-01-02",
          body: `## 1. Penerimaan Ketentuan
Dengan memesan, mengakses, atau menggunakan layanan WangStore ("Layanan"), Anda menyetujui Ketentuan Layanan ini. Jika Anda tidak setuju, jangan gunakan Layanan.

## 2. Layanan
WangStore menyediakan Minecraft Hosting, VPS, Dedicated Server, dan Panel Hosting. Spesifikasi yang Anda pilih pada Server Builder menjadi bagian dari kontrak layanan.

## 3. Akun & Keamanan
Anda bertanggung jawab menjaga kredensial akun dan seluruh aktivitas di dalamnya. Beritahu kami segera bila ada dugaan penyalahgunaan.

## 4. Pembayaran
Layanan ditagih bulanan di muka dalam Rupiah. Keterlambatan lebih dari 3 hari menyebabkan suspensi, dan lebih dari 14 hari menyebabkan terminasi beserta penghapusan data.

## 5. Penggunaan yang Dilarang
Lihat Acceptable Use Policy. Pelanggaran berat dapat berakibat terminasi tanpa refund.

## 6. Batasan Tanggung Jawab
Tanggung jawab WangStore dibatasi maksimal sebesar biaya layanan satu bulan terakhir untuk layanan yang terdampak.

## 7. Perubahan
Ketentuan dapat diperbarui; perubahan material diumumkan minimal 14 hari sebelumnya melalui email dan halaman Announcement.`,
        },
        privacy: {
          title: "Privacy Policy",
          updatedAt: "2026-01-02",
          body: `## Data yang Kami Kumpulkan
Nama, email, nomor WhatsApp, konfigurasi server, alamat IP, log akses, dan catatan tiket dukungan.

## Dasar Pemrosesan
Pelaksanaan kontrak layanan, kepentingan sah (keamanan & pencegahan penyalahgunaan), serta kewajiban hukum.

## Penyimpanan
Data pelanggan disimpan di data center Indonesia dan Singapura. Log keamanan disimpan maksimal 90 hari, data penagihan 5 tahun sesuai ketentuan perpajakan.

## Berbagi Data
Kami tidak menjual data. Data dapat dibagikan ke penyedia infrastruktur, gateway pembayaran, dan otoritas berwenang bila diwajibkan hukum.

## Hak Anda
Akses, koreksi, penghapusan, portabilitas, dan penarikan persetujuan melalui halo@wangstore.id — dijawab maksimal 14 hari kerja.

## Keamanan
Enkripsi TLS 1.3 in-transit, hashing bcrypt untuk kata sandi, kontrol akses berbasis peran, dan audit log untuk seluruh tindakan administratif.`,
        },
        refund: {
          title: "Refund Policy",
          updatedAt: "2026-01-02",
          body: `## Garansi 7 Hari
Layanan Minecraft Hosting dan VPS baru dapat direfund penuh dalam 7 hari pertama bila layanan tidak sesuai spesifikasi yang dijanjikan.

## Tidak Dapat Direfund
Dedicated Server, biaya setup khusus, dedicated IP, lisensi pihak ketiga, dan akun yang diterminasi karena pelanggaran AUP.

## Prorata
Upgrade dihitung prorata; downgrade berlaku pada siklus tagihan berikutnya.

## Proses
Ajukan lewat tiket dukungan. Verifikasi maksimal 3 hari kerja, dana kembali 5–14 hari kerja tergantung metode pembayaran.`,
        },
        sla: {
          title: "Service Level Agreement",
          updatedAt: "2026-01-02",
          body: `## Komitmen Uptime
Network & power uptime bulanan 99.9% untuk seluruh node produksi (tidak termasuk pemeliharaan terjadwal yang diumumkan minimal 48 jam sebelumnya).

## Kredit Layanan
| Uptime bulanan | Kredit |
| --- | --- |
| 99.0% – 99.89% | 10% |
| 95.0% – 98.99% | 25% |
| < 95.0% | 50% |

## Waktu Respons Dukungan
Kritis 15 menit, tinggi 1 jam, normal 4 jam, rendah 12 jam.

## Klaim
Ajukan maksimal 14 hari setelah insiden melalui tiket, sertakan waktu kejadian dan ID server. Kredit diberikan sebagai potongan tagihan berikutnya.`,
        },
        aup: {
          title: "Acceptable Use Policy",
          updatedAt: "2026-01-02",
          body: `## Dilarang Keras
- Serangan DDoS, port scanning, brute force, atau aktivitas hacking dari infrastruktur kami
- Phishing, malware, botnet C2, spam, dan kartu kredit curian
- Konten yang melanggar hukum Republik Indonesia, termasuk perjudian ilegal dan CSAM
- Cryptomining pada paket shared/Minecraft Hosting
- Pelanggaran hak cipta dan distribusi software bajakan

## Penggunaan Wajar
Bandwidth unmetered mengikuti prinsip fair-use; penggunaan sustained di atas 80% kapasitas port dapat dibatasi setelah pemberitahuan.

## Penegakan
Peringatan → suspensi → terminasi. Pelanggaran kritis dapat langsung diterminasi dan dilaporkan ke pihak berwenang.`,
        },
        cookie: {
          title: "Cookie Policy",
          updatedAt: "2026-01-02",
          body: `## Jenis Cookie
- **Esensial**: sesi login admin/pelanggan, proteksi CSRF. Tidak dapat dinonaktifkan.
- **Preferensi**: penyimpanan konfigurasi Server Builder tersimpan di perangkat Anda.
- **Analitik**: statistik kunjungan teragregasi, tanpa profil individual.

## Kontrol
Anda dapat menghapus cookie melalui pengaturan browser. Menonaktifkan cookie esensial akan menghentikan fungsi login.

## Pihak Ketiga
Kami tidak memasang cookie iklan pihak ketiga.`,
        },
      },
      about: {
        story:
          "WangStore lahir tahun 2019 dari satu node kecil di Jakarta yang dipakai untuk menampung server survival milik komunitas teman sendiri. Ketika lag membuat 40 pemain keluar dalam satu malam, kami memutuskan membangun ulang semuanya: CPU frekuensi tinggi, NVMe Gen4, jaringan ter-filter, dan panel yang benar-benar bisa dipakai orang non-teknis. Hari ini WangStore menjalankan ribuan instance game dan cloud di lima region, tetapi cara kerjanya tetap sama — dengarkan pemain, ukur TPS, perbaiki sampai mulus.",
        vision:
          "Menjadi fondasi infrastruktur paling andal bagi kreator, komunitas game, dan developer di Asia Tenggara.",
        mission: [
          "Memberi kebebasan penuh: tidak ada paket kaku, semua sumber daya dapat diracik sendiri.",
          "Menjaga performa nyata — target 20 TPS stabil, bukan sekadar angka spesifikasi.",
          "Transparan pada harga, uptime, dan insiden.",
          "Support manusia 24/7 dalam Bahasa Indonesia dan Inggris.",
        ],
        team: [
          {
            name: "Wangsa Pratama",
            role: "Founder & Principal Architect",
            bio: "12 tahun membangun infrastruktur bare-metal dan jaringan anti-DDoS untuk penyedia game hosting.",
          },
          {
            name: "Rania Dewanti",
            role: "Head of Infrastructure",
            bio: "Mengelola armada node Ryzen & EPYC, otomasi provisioning, serta kapasitas lintas region.",
          },
          {
            name: "Bagas Herlambang",
            role: "Lead Platform Engineer",
            bio: "Membangun panel, API, dan pipeline deployment WangStore di atas Next.js dan Docker.",
          },
          {
            name: "Sinta Maharani",
            role: "Customer Success Lead",
            bio: "Memimpin tim dukungan 24/7 dan program onboarding komunitas Minecraft.",
          },
        ],
        tech: [
          "AMD Ryzen 9 7950X & EPYC Genoa",
          "NVMe Gen4 RAID-10",
          "Jaringan 10–40 Gbps ter-filter",
          "Pterodactyl & Reviactyl Panel",
          "Docker + PM2 orchestration",
          "PostgreSQL 16 & Redis 7",
          "Prometheus + Grafana observability",
          "Backup terenkripsi harian off-site",
        ],
      },
    },
    regions: [
      { id: "id", name: "Indonesia", flag: "🇮🇩", city: "Jakarta", latencyMs: 6, priceMultiplier: 1, enabled: true },
      { id: "sg", name: "Singapore", flag: "🇸🇬", city: "Singapore", latencyMs: 18, priceMultiplier: 1.15, enabled: true },
      { id: "jp", name: "Japan", flag: "🇯🇵", city: "Tokyo", latencyMs: 68, priceMultiplier: 1.25, enabled: true },
      { id: "de", name: "Germany", flag: "🇩🇪", city: "Frankfurt", latencyMs: 172, priceMultiplier: 1.2, enabled: true },
      { id: "us", name: "USA", flag: "🇺🇸", city: "Ashburn", latencyMs: 210, priceMultiplier: 1.2, enabled: true },
    ],
    priceFormula: {
      currency: "IDR",
      base: 5000,
      perCore: 7000,
      perGbRam: 4500,
      perGbSsd: 300,
      perGbNvme: 550,
      perGbHdd: 120,
      perTbBandwidth: 4000,
      dedicatedIp: 25000,
      perExtraPort: 3000,
      backup: 15000,
      prioritySupport: 30000,
      ddosAdvanced: 20000,
      panelPterodactyl: 10000,
      panelReviactyl: 12000,
    },
    coupons: [
      {
        code: "WANG10",
        type: "PERCENT",
        value: 10,
        active: true,
        maxUses: 500,
        uses: 128,
        expiresAt: "2026-12-31T23:59:59.000Z",
        description: "Diskon 10% untuk semua konfigurasi.",
      },
      {
        code: "NEWBUILD",
        type: "FIXED",
        value: 25000,
        active: true,
        maxUses: 200,
        uses: 41,
        expiresAt: "2026-09-30T23:59:59.000Z",
        description: "Potongan Rp25.000 untuk pelanggan baru.",
      },
      {
        code: "COMMUNITY20",
        type: "PERCENT",
        value: 20,
        active: true,
        maxUses: 100,
        uses: 12,
        expiresAt: null,
        description: "Khusus komunitas partner WangStore.",
      },
    ],
    orders: [],
    tickets: [],
    posts: [
      {
        slug: "cara-memilih-cpu-untuk-server-minecraft",
        title: "Cara Memilih CPU untuk Server Minecraft yang Stabil 20 TPS",
        excerpt:
          "Minecraft sangat bergantung pada performa single-thread. Panduan ini menjelaskan cara membaca clock speed, IPC, dan jumlah core yang benar-benar dipakai server.",
        category: "Panduan",
        tags: ["minecraft", "hardware", "performa"],
        author: "Rania Dewanti",
        publishedAt: "2026-01-06",
        cover: null,
        published: true,
        body: `Server Minecraft vanilla menjalankan hampir seluruh logika dunia di satu thread utama. Artinya CPU 32 core dengan clock rendah bisa kalah telak dari CPU 8 core berkecepatan 5,7 GHz.

## Yang benar-benar penting

1. **Clock efektif per core.** Target minimal 4,5 GHz all-core untuk 60+ pemain.
2. **IPC generasi CPU.** Ryzen 7000 memberi sekitar 13% keunggulan per clock dibanding Ryzen 5000.
3. **Cache besar.** Chunk loading sangat sensitif terhadap L3 cache; varian X3D unggul di sini.

## Berapa core yang perlu dibeli?

| Pemain | Core disarankan | RAM |
| --- | --- | --- |
| 10–20 | 2 | 4–6 GB |
| 20–50 | 4 | 8–12 GB |
| 50–100 | 6 | 16 GB |
| 100+ / network | 8+ | 24 GB+ |

Core tambahan tetap berguna: chunk generation asinkron di Paper, kompresi backup, plugin ekonomi berbasis database, dan proses panel.

## Tips konfigurasi

- Gunakan Paper atau Purpur, bukan Vanilla, untuk server publik.
- Set \`view-distance\` 6 dan \`simulation-distance\` 4 sebelum menambah hardware.
- Aktifkan pregenerator dunia agar chunk baru tidak dibuat saat prime time.

Di Server Builder WangStore, estimasi TPS dihitung langsung dari kombinasi core, RAM, jumlah pemain, dan jenis software yang Anda pilih.`,
      },
      {
        slug: "paper-vs-purpur-vs-fabric",
        title: "Paper vs Purpur vs Fabric: Memilih Software Server yang Tepat",
        excerpt:
          "Perbandingan praktis antara server software populer dari sisi performa, ekosistem plugin/mod, dan kemudahan pemeliharaan.",
        category: "Panduan",
        tags: ["paper", "purpur", "fabric", "modding"],
        author: "Bagas Herlambang",
        publishedAt: "2026-01-09",
        cover: null,
        published: true,
        body: `Pilihan software menentukan 40% performa server Anda — sering kali lebih berpengaruh daripada menambah 4 GB RAM.

## Paper
Fork Spigot dengan optimasi besar dan konfigurasi mendalam. Kompatibel dengan hampir semua plugin Bukkit/Spigot. Pilihan default untuk survival dan SMP publik.

## Purpur
Fork Paper dengan ratusan opsi gameplay tambahan (ridable mobs, tweak mekanik). Performanya setara Paper dengan fleksibilitas lebih tinggi, cocok untuk server yang ingin fitur unik tanpa plugin ekstra.

## Fabric
Ringan dan modern, ekosistem mod cepat mengikuti versi baru Minecraft. Butuh mod performa seperti Lithium dan Krypton. Gunakan bila komunitas Anda memakai modpack.

## Forge & NeoForge
Untuk modpack besar. Konsumsi RAM jauh lebih tinggi — modpack 150+ mod nyaman di 8–12 GB RAM.

## Velocity & Waterfall
Proxy untuk network multi-server. Velocity direkomendasikan karena modern, aman, dan hemat sumber daya; Waterfall untuk kompatibilitas plugin BungeeCord lama.

Semua software di atas tersedia sekali klik pada Server Builder WangStore.`,
      },
      {
        slug: "anatomi-proteksi-ddos-wangstore",
        title: "Anatomi Proteksi DDoS di WangStore",
        excerpt:
          "Bagaimana lapisan scrubbing, rate limiting Nginx, Cloudflare, dan Fail2Ban bekerja bersama — serta apa yang tidak bisa dijanjikan siapa pun.",
        category: "Infrastruktur",
        tags: ["keamanan", "ddos", "jaringan"],
        author: "Wangsa Pratama",
        publishedAt: "2026-01-11",
        cover: null,
        published: true,
        body: `Mitigasi DDoS bukan satu tombol, melainkan rantai pertahanan berlapis.

## Lapisan 1 — Upstream scrubbing
Trafik masuk melalui pusat scrubbing penyedia transit. Serangan volumetrik L3/L4 (UDP flood, amplification) diserap sebelum menyentuh node kami.

## Lapisan 2 — Edge WAF
Cloudflare menyaring HTTP flood, bot buruk, dan permintaan mencurigakan dengan managed rules serta rate limiting per IP.

## Lapisan 3 — Nginx
Zona \`limit_req\` dan \`limit_conn\` membatasi burst pada endpoint sensitif seperti login dan API order.

## Lapisan 4 — Fail2Ban
Log dianalisis realtime; IP dengan pola brute force atau scanning otomatis diblokir di firewall.

## Lapisan 5 — Aplikasi
Validasi input Zod, proteksi CSRF, header keamanan ketat, dan audit log seluruh tindakan admin.

## Yang jujur harus dikatakan
Tidak ada penyedia yang bisa menjamin 100% kekebalan. Serangan yang melebihi kapasitas transit tetap dapat menyebabkan degradasi. Yang kami janjikan adalah kapasitas terukur, transparansi insiden, dan kredit SLA bila target uptime tidak tercapai.`,
      },
      {
        slug: "checklist-launching-server-komunitas",
        title: "Checklist Launching Server Komunitas dalam 7 Hari",
        excerpt:
          "Rencana harian dari pemilihan spesifikasi sampai hari peluncuran, termasuk moderasi, backup, dan strategi promosi.",
        category: "Komunitas",
        tags: ["komunitas", "launch", "operasional"],
        author: "Sinta Maharani",
        publishedAt: "2026-01-10",
        cover: null,
        published: true,
        body: `## Hari 1 — Tentukan konsep
Survival, SMP, minigame, atau modpack? Konsep menentukan spesifikasi dan software.

## Hari 2 — Pesan server
Gunakan Server Builder, mulai dari 4 core / 8 GB untuk target 40 pemain. Pilih region terdekat dengan mayoritas pemain.

## Hari 3 — Konfigurasi inti
Pasang plugin esensial: perlindungan grief, ekonomi, permission, anti-cheat. Batasi jumlah plugin di bawah rekomendasi builder.

## Hari 4 — Pregenerate dunia
Jalankan pregenerator radius 5.000 blok agar TPS stabil saat pemain menyebar.

## Hari 5 — Moderasi & aturan
Siapkan Discord, kanal aturan, tim moderator, dan prosedur banding.

## Hari 6 — Uji beban
Undang 15–20 tester, pantau TPS dan penggunaan RAM di panel, lalu sesuaikan view-distance.

## Hari 7 — Launch
Aktifkan backup otomatis, umumkan di komunitas, dan pantau grafik performa selama 6 jam pertama.`,
      },
    ],
    articles: [
      {
        slug: "menghubungkan-domain-ke-server",
        title: "Menghubungkan Domain ke Server Minecraft",
        category: "Getting Started",
        updatedAt: "2026-01-05",
        body: `1. Buka pengelola DNS domain Anda.
2. Buat record **A** bernama \`play\` yang mengarah ke IP server dari panel.
3. Jika server memakai port selain 25565, tambahkan record **SRV**: \`_minecraft._tcp.play\` dengan priority 0, weight 5, port sesuai server, target \`play.domainanda.com\`.
4. Tunggu propagasi 5–30 menit, lalu uji koneksi dengan alamat \`play.domainanda.com\`.

Jika tetap gagal, pastikan proxy Cloudflare **dimatikan** (abu-abu) untuk record tersebut karena Cloudflare gratis tidak memproxy trafik Minecraft.`,
      },
      {
        slug: "mengatasi-tps-rendah",
        title: "Mengatasi TPS Rendah dan Lag Server",
        category: "Performance",
        updatedAt: "2026-01-08",
        body: `Jalankan \`/timings on\` (Paper) atau \`/spark profiler start\` lalu kumpulkan data 5 menit saat lag terjadi.

**Penyebab tersering:**
- View distance terlalu besar (turunkan ke 6)
- Redstone farm atau mob farm masif (batasi dengan \`spawn-limits\`)
- Plugin dengan query database sinkron
- Chunk generation saat pemain menjelajah (gunakan pregenerator)
- RAM kurang sehingga garbage collection sering berjalan

**Langkah cepat:** turunkan simulation-distance, aktifkan \`optimize-explosions\`, dan pastikan alokasi RAM tidak melebihi 75% total agar OS tetap punya ruang.`,
      },
      {
        slug: "backup-dan-restore",
        title: "Backup Otomatis dan Cara Restore",
        category: "Operations",
        updatedAt: "2026-01-07",
        body: `Add-on Automatic Backup membuat snapshot harian terenkripsi dan menyimpannya 7 hari off-site.

**Restore melalui panel:**
1. Masuk ke panel → tab Backups.
2. Pilih snapshot, klik Restore, konfirmasi.
3. Server berhenti otomatis, data dipulihkan, lalu dinyalakan kembali.

**Restore manual server WangStore (self-host):** jalankan \`bash scripts/restore.sh backups/wangstore-YYYYmmdd-HHMMSS.tar.gz\`.

Selalu unduh salinan lokal sebelum melakukan perubahan besar seperti migrasi versi Minecraft.`,
      },
      {
        slug: "keamanan-akun-dan-2fa",
        title: "Mengamankan Akun WangStore Anda",
        category: "Security",
        updatedAt: "2026-01-09",
        body: `- Gunakan kata sandi unik minimal 12 karakter.
- Aktifkan verifikasi email dan jaga akses inbox Anda.
- Jangan bagikan token API panel di Discord publik.
- Tinjau Audit Log secara berkala untuk melihat tindakan administratif.
- Untuk tim, berikan peran **Staff** (hanya baca + tiket) alih-alih Admin.

Struktur otentikasi WangStore sudah 2FA-ready: aktifkan TOTP dari halaman profil begitu tersedia untuk akun Anda.`,
      },
    ],
    faqs: [
      {
        id: "faq_1",
        question: "Berapa lama server aktif setelah pembayaran?",
        answer:
          "Minecraft Hosting dan VPS aktif otomatis rata-rata 3–10 menit setelah pembayaran terkonfirmasi. Dedicated Server membutuhkan 2–24 jam karena provisioning bare-metal.",
        category: "Umum",
      },
      {
        id: "faq_2",
        question: "Apakah saya bisa upgrade spesifikasi kapan saja?",
        answer:
          "Bisa. Upgrade CPU, RAM, dan storage dihitung prorata dan diterapkan dengan satu kali restart singkat. Downgrade berlaku pada siklus tagihan berikutnya.",
        category: "Billing",
      },
      {
        id: "faq_3",
        question: "Apakah ada batas jumlah pemain?",
        answer:
          "Tidak ada batas buatan. Jumlah pemain nyata ditentukan oleh CPU, RAM, jumlah plugin, dan view-distance. Estimasi realistis ditampilkan langsung di Server Builder.",
        category: "Minecraft",
      },
      {
        id: "faq_4",
        question: "Panel apa yang digunakan?",
        answer:
          "Anda dapat memilih Pterodactyl, Reviactyl, atau tanpa panel (akses SSH penuh) saat konfigurasi.",
        category: "Minecraft",
      },
      {
        id: "faq_5",
        question: "Bagaimana kebijakan refund?",
        answer:
          "Garansi 7 hari untuk layanan Minecraft Hosting dan VPS baru. Detail lengkap ada di halaman Refund Policy.",
        category: "Billing",
      },
      {
        id: "faq_6",
        question: "Apakah proteksi DDoS termasuk?",
        answer:
          "Ya, proteksi L3/L4 standar termasuk pada semua layanan. Add-on Advanced DDoS menambahkan filter L7 dan aturan khusus per game.",
        category: "Keamanan",
      },
      {
        id: "faq_7",
        question: "Metode pembayaran apa yang diterima?",
        answer:
          "Transfer bank, QRIS, e-wallet (GoPay, OVO, DANA), dan kartu kredit. Konfirmasi dilakukan lewat WhatsApp setelah order dibuat.",
        category: "Billing",
      },
      {
        id: "faq_8",
        question: "Apakah data saya dibackup?",
        answer:
          "Add-on Automatic Backup membuat snapshot harian terenkripsi dengan retensi 7 hari di lokasi terpisah. Kami tetap menyarankan Anda menyimpan salinan lokal berkala.",
        category: "Keamanan",
      },
    ],
    nodes: [
      { id: "jkt-01", name: "Node Jakarta 01", region: "Indonesia", status: "OPERATIONAL", uptime30d: 99.99, cpu: "Ryzen 9 7950X", ram: "128 GB DDR5", storage: "4× NVMe Gen4 RAID-10", network: "10 Gbps filtered" },
      { id: "jkt-02", name: "Node Jakarta 02", region: "Indonesia", status: "OPERATIONAL", uptime30d: 99.97, cpu: "Ryzen 9 7900X", ram: "128 GB DDR5", storage: "4× NVMe Gen4 RAID-10", network: "10 Gbps filtered" },
      { id: "sgp-01", name: "Node Singapore 01", region: "Singapore", status: "OPERATIONAL", uptime30d: 99.98, cpu: "EPYC 9354", ram: "256 GB DDR5", storage: "8× NVMe Gen4 RAID-10", network: "40 Gbps filtered" },
      { id: "tyo-01", name: "Node Tokyo 01", region: "Japan", status: "OPERATIONAL", uptime30d: 99.95, cpu: "Ryzen 9 7950X3D", ram: "128 GB DDR5", storage: "4× NVMe Gen4 RAID-10", network: "10 Gbps filtered" },
      { id: "fra-01", name: "Node Frankfurt 01", region: "Germany", status: "MAINTENANCE", uptime30d: 99.9, cpu: "EPYC 9254", ram: "256 GB DDR5", storage: "8× NVMe Gen4 RAID-10", network: "20 Gbps filtered" },
      { id: "ash-01", name: "Node Ashburn 01", region: "USA", status: "OPERATIONAL", uptime30d: 99.93, cpu: "Ryzen 9 7950X", ram: "128 GB DDR5", storage: "4× NVMe Gen4 RAID-10", network: "10 Gbps filtered" },
    ],
    incidents: [
      {
        id: "inc_2026_01_10",
        title: "Pemeliharaan terjadwal upgrade RAID controller Frankfurt 01",
        startedAt: "2026-01-12T18:00:00.000Z",
        resolvedAt: null,
        severity: "MAINTENANCE",
        affected: ["fra-01"],
        updates: [
          { at: "2026-01-10T09:00:00.000Z", body: "Pemeliharaan dijadwalkan 12 Januari 18:00–21:00 UTC. Estimasi downtime 25 menit." },
          { at: "2026-01-12T18:04:00.000Z", body: "Pekerjaan dimulai. Instance dimigrasikan sementara ke node cadangan." },
        ],
      },
      {
        id: "inc_2026_01_04",
        title: "Peningkatan latency transit Singapura",
        startedAt: "2026-01-04T13:20:00.000Z",
        resolvedAt: "2026-01-04T14:05:00.000Z",
        severity: "MINOR",
        affected: ["sgp-01"],
        updates: [
          { at: "2026-01-04T13:20:00.000Z", body: "Terdeteksi latency naik 40 ms pada salah satu upstream." },
          { at: "2026-01-04T13:38:00.000Z", body: "Trafik dialihkan ke jalur transit alternatif." },
          { at: "2026-01-04T14:05:00.000Z", body: "Latency kembali normal. Insiden ditutup." },
        ],
      },
      {
        id: "inc_2025_12_21",
        title: "Serangan volumetrik 480 Gbps ke range Jakarta",
        startedAt: "2025-12-21T20:11:00.000Z",
        resolvedAt: "2025-12-21T20:39:00.000Z",
        severity: "MAJOR",
        affected: ["jkt-01", "jkt-02"],
        updates: [
          { at: "2025-12-21T20:11:00.000Z", body: "Scrubbing otomatis aktif, sebagian pemain mengalami packet loss." },
          { at: "2025-12-21T20:26:00.000Z", body: "Filter khusus diterapkan pada pola amplification NTP." },
          { at: "2025-12-21T20:39:00.000Z", body: "Serangan mereda, seluruh layanan normal. Kredit SLA diberikan otomatis." },
        ],
      },
    ],
    announcements: [
      {
        id: "ann_1",
        body: "Region Tokyo kini tersedia — latency 68 ms dari Jakarta dengan NVMe Gen4.",
        level: "SUCCESS",
        active: true,
      },
    ],
    audit: [],
    testimonials: [
      { name: "Fajar Nugroho", role: "Owner SkyRealm SMP", body: "Pindah dari penyedia lama, TPS naik dari 14 ke 20 stabil dengan spesifikasi yang sama. Support-nya benar-benar 24 jam.", rating: 5 },
      { name: "Kevin Halim", role: "Network Admin CraftNusa", body: "Velocity + 4 backend server jalan mulus. Konfigurasi bebas bikin kami cuma bayar yang dipakai.", rating: 5 },
      { name: "Putri Anindya", role: "Content Creator", body: "Server buat live event 120 penonton nggak drop sama sekali. Panelnya gampang dipakai walau saya bukan teknisi.", rating: 5 },
      { name: "Dimas Prakoso", role: "Backend Developer", body: "VPS-nya konsisten, disk NVMe cepat, dan snapshot restore-nya menyelamatkan saya dua kali.", rating: 5 },
      { name: "Laras Wibowo", role: "Guru Informatika", body: "Kami pakai untuk kelas coding 30 siswa. Harga terjangkau dan tim WangStore bantu setup dari nol.", rating: 5 },
      { name: "Yoga Saputra", role: "Owner ModPack Server", body: "Modpack 180 mod di 12 GB RAM tetap enak dimainkan. Backup harian jalan tanpa saya pikirkan.", rating: 4 },
    ],

    // Shared Hosting Packages
    sharedHosting: [
      {
        id: "shared-starter",
        name: "Starter",
        description: "Cocok untuk website pribadi atau blog kecil.",
        price: 35000,
        disk: "10 GB SSD",
        bandwidth: "Unlimited",
        websites: 1,
        email: 5,
        databases: 1,
        features: ["Free SSL", "1-click WordPress", "Daily Backup", "24/7 Support"],
      },
      {
        id: "shared-professional",
        name: "Professional",
        description: "Ideal untuk bisnis kecil dan portfolio.",
        price: 65000,
        disk: "25 GB SSD",
        bandwidth: "Unlimited",
        websites: 5,
        email: 25,
        databases: 5,
        features: ["Free SSL", "1-click WordPress", "Daily Backup", "24/7 Support", "CDN"],
        popular: true,
      },
      {
        id: "shared-business",
        name: "Business",
        description: "Untuk agency atau website skala menengah.",
        price: 115000,
        disk: "50 GB SSD",
        bandwidth: "Unlimited",
        websites: 15,
        email: 50,
        databases: 15,
        features: ["Free SSL", "1-click WordPress", "Daily Backup", "24/7 Support", "CDN", "Priority Support"],
      },
    ],

    // Bot Hosting Packages
    botHosting: [
      {
        id: "bot-basic",
        name: "Basic Bot",
        description: "Cocok untuk bot Discord kecil atau Telegram bot.",
        price: 25000,
        ram: "1 GB",
        cpu: "1 Core",
        storage: "10 GB",
        maxBots: 2,
        features: ["24/7 Uptime", "Auto Restart", "Basic DDoS Protection", "SSH Access"],
      },
      {
        id: "bot-standard",
        name: "Standard Bot",
        description: "Untuk bot dengan fitur lengkap dan traffic sedang.",
        price: 45000,
        ram: "2 GB",
        cpu: "2 Core",
        storage: "25 GB",
        maxBots: 5,
        features: ["24/7 Uptime", "Auto Restart", "Advanced DDoS", "SSH Access", "Daily Backup"],
        popular: true,
      },
      {
        id: "bot-premium",
        name: "Premium Bot",
        description: "Untuk bot besar atau multiple bot dengan performa tinggi.",
        price: 85000,
        ram: "4 GB",
        cpu: "4 Core",
        storage: "50 GB",
        maxBots: 10,
        features: ["24/7 Uptime", "Auto Restart", "Advanced DDoS", "SSH Access", "Daily Backup", "Priority Support"],
      },
    ],

    // Dedicated Servers (Manual Inventory)
    dedicatedServers: [
      {
        id: "dedi-entry",
        name: "Entry Dedicated",
        cpu: "Intel Xeon E5-2680 v4 (14 Core)",
        ram: "64 GB DDR4",
        storage: "2× 480 GB SSD",
        bandwidth: "1 Gbps Unmetered",
        price: 1250000,
        stock: 3,
        location: "Jakarta",
        available: true,
      },
      {
        id: "dedi-pro",
        name: "Pro Dedicated",
        cpu: "AMD EPYC 7402P (24 Core)",
        ram: "128 GB DDR4",
        storage: "2× 960 GB NVMe",
        bandwidth: "1 Gbps Unmetered",
        price: 2450000,
        stock: 2,
        location: "Jakarta",
        available: true,
      },
      {
        id: "dedi-ultra",
        name: "Ultra Dedicated",
        cpu: "AMD Ryzen 9 7950X (16 Core)",
        ram: "256 GB DDR5",
        storage: "2× 1.92 TB NVMe",
        bandwidth: "10 Gbps Unmetered",
        price: 3850000,
        stock: 1,
        location: "Singapore",
        available: true,
      },
    ],

    // Other Services
    otherServices: [
      {
        id: "svc-ip",
        name: "Dedicated IPv4",
        description: "Alamat IP publik eksklusif",
        price: 25000,
        unit: "bulan",
        category: "Networking",
      },
      {
        id: "svc-backup",
        name: "Extra Backup Retention",
        description: "Penyimpanan backup tambahan 30 hari",
        price: 45000,
        unit: "bulan",
        category: "Storage",
      },
      {
        id: "svc-migration",
        name: "Server Migration",
        description: "Migrasi server dari provider lain",
        price: 150000,
        unit: "sekali",
        category: "Service",
      },
      {
        id: "svc-setup",
        name: "Custom Setup",
        description: "Instalasi & konfigurasi khusus",
        price: 200000,
        unit: "sekali",
        category: "Service",
      },
    ],
  };
}
