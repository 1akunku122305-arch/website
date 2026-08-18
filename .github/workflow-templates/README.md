# GitHub Actions Workflow Templates

Jika workflow di `.github/workflows/` tidak dapat berjalan karena izin repository
misalnya, salin file berikut ke `.github/workflows/` dan aktifkan di
Settings → Actions:

- `codeql.yml.txt` → CodeQL Security Analysis
  Persyaratan: permission `security-events: write` dan CodeQL GitHub App.
  Aktifkan di repository Settings → Security & analysis → Code scanning.

Workflow lain (CI, test, dependency audit) tersedia langsung di
`.github/workflows/`.
