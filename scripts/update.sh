#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# WangStore — zero-guesswork updater
# Backs up first, pulls the latest code, rebuilds, restarts, health-checks,
# and rolls back automatically if the new version fails to come up.
# ---------------------------------------------------------------------------
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ROOT="$(repo_root)"; cd "$ROOT"
banner
log "Updating WangStore"

PREV_REF="$(git rev-parse HEAD)"
log "Current revision: ${PREV_REF:0:8}"

log "Creating a safety backup"
bash scripts/backup.sh --quiet

log "Fetching the latest changes"
git fetch --all --prune
git pull --ff-only

if docker compose -f docker/docker-compose.yml ps --quiet 2>/dev/null | grep -q .; then
  log "Rebuilding containers"
  docker compose -f docker/docker-compose.yml --env-file .env up -d --build
else
  log "Installing dependencies"
  npm ci --omit=dev --no-audit --no-fund
  log "Building"
  npm run build
  if require_cmd pm2; then
    pm2 reload ecosystem.config.js --update-env
  else
    warn "PM2 not found — restart the service manually"
  fi
fi

log "Verifying health"
if wait_for_health "http://127.0.0.1:3000/api/health" 40; then
  ok "Update complete and healthy"
else
  warn "Health check failed — rolling back to ${PREV_REF:0:8}"
  git reset --hard "$PREV_REF"
  if docker compose -f docker/docker-compose.yml ps --quiet 2>/dev/null | grep -q .; then
    docker compose -f docker/docker-compose.yml --env-file .env up -d --build
  else
    npm ci --omit=dev --no-audit --no-fund && npm run build
    require_cmd pm2 && pm2 reload ecosystem.config.js --update-env
  fi
  die "Rolled back to the previous revision"
fi
