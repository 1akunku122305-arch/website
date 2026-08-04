# GitHub Actions workflows

These workflow definitions ship here rather than in `.github/workflows/` because
the automation account used to open this pull request does not hold the GitHub
`workflows` permission, so it cannot create files under that path.

Activate them with a single command after merging:

```bash
mkdir -p .github/workflows
git mv .github/workflow-templates/ci.yml .github/workflow-templates/codeql.yml .github/workflows/
git commit -m "ci: activate GitHub Actions workflows"
git push
```

## What they do

### `ci.yml`

Runs on every push to `main` and on pull requests.

| Job | Steps |
| --- | --- |
| `quality` | `npm ci` → `tsc --noEmit` → `npm run lint` → `npm run build` → smoke test of `/api/health`, `/`, `/builder`, `/blog`, `/status`, `/legal/terms`, `/sitemap.xml`, `/robots.txt` |
| `shellcheck` | `bash -n` on every script in `scripts/` plus ShellCheck at error severity |
| `security` | `npm audit --omit=dev --audit-level=high` |
| `docker` | Builds `docker/Dockerfile` with GitHub Actions layer caching |

### `codeql.yml`

CodeQL static analysis for JavaScript/TypeScript using the
`security-and-quality` query suite, on push, pull request, and a weekly
schedule. Requires the `security-events: write` permission, which is already
declared in the workflow.
