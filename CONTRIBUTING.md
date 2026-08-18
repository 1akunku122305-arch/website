# Contributing

Terima kasih ingin berkontribusi ke WangStore!

## Alur

1. Fork dan buat branch: `feat/nama-fitur`.
2. Jalankan kualitas kode sebelum commit:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   ```
3. Pastikan tidak ada error/warning TypeScript, ESLint, dan build sukses.
4. Tambahkan tes untuk fitur baru (terutama pricing/business rules).
5. Buat Pull Request dengan deskripsi jelas.

## Pedoman

- Gunakan Bahasa Indonesia untuk teks UI.
- Jangan tambahkan placeholder / fake data / dead button.
- Jangan memakai `any`.
- Ikuti arsitektur yang sudah ada (DRY, satu sumber kebenaran).
- Jangan commit secret.
