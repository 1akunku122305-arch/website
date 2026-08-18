# GitHub Actions Workflow Templates

Workflow di folder ini **tidak** berjalan otomatis karena repo GitHub App/pat pada
environment ini tidak memiliki izin `workflows` (membuat/memperbarui file di
`.github/workflows/` ditolak oleh GitHub).

## Cara Aktivasi

1. Pastikan token/App yang dipakai untuk push memiliki izin **Workflows**
   (`Settings → Actions → General → Workflow permissions`, atau PAT dengan scope `workflow`).
2. Salin template yang diinginkan dari folder ini ke `.github/workflows/`:
   ```bash
   cp .github/workflow-templates/ci.yml .github/workflows/ci.yml
   cp .github/workflow-templates/codeql.yml .github/workflows/codeql.yml
   ```
3. Commit dan push. Workflow akan muncul di tab **Actions**.

> Tanpa izin `workflows`, GitHub menolak commit yang berisi file `.github/workflows/`
> (error: *refusing to allow a GitHub App to create or update workflow*).

## Template

- `ci.yml` — typecheck, lint, build, unit/business test, dependency audit.
- `codeql.yml` — CodeQL Security Analysis (butuh permission `security-events: write`).
