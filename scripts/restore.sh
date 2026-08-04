#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# WangStore — restore
#   bash scripts/restore.sh backups/wangstore-YYYYmmdd-HHMMSS.tar.gz [--yes]
#   bash scripts/restore.sh --latest
# Restores the datastore, uploads, and PostgreSQL dump from an archive. The
# current state is snapshotted first so a bad restore is always reversible.
# ---------------------------------------------------------------------------
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ROOT="$(repo_root)"; cd "$ROOT"
banner

ARCHIVE=""
ASSUME_YES=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --latest) ARCHIVE="$(ls -1t backups/wangstore-*.tar.gz 2>/dev/null | head -1 || true)"; shift ;;
    --yes|-y) ASSUME_YES=1; shift ;;
    *) ARCHIVE="$1"; shift ;;
  esac
done

[[ -n "$ARCHIVE" ]] || die "Usage: bash scripts/restore.sh <archive.tar.gz> | --latest"
[[ -f "$ARCHIVE" ]] || die "Archive not found: $ARCHIVE"

log "Archive: $ARCHIVE"
if [[ "$ASSUME_YES" -eq 0 ]]; then
  read -r -p "This overwrites the current data. Continue? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || die "Aborted"
fi

log "Snapshotting the current state first"
bash scripts/backup.sh --quiet --output "$ROOT/backups/pre-restore"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
tar -xzf "$ARCHIVE" -C "$STAGE"
SRC="$STAGE/wangstore"
[[ -d "$SRC" ]] || die "Malformed archive: missing wangstore/ directory"

[[ -f "$SRC/CREATED_AT" ]] && log "Backup created at $(cat "$SRC/CREATED_AT")"
if [[ -f "$SRC/REVISION" ]]; then REV="$(cat "$SRC/REVISION")"; log "Backup revision ${REV:0:8}"; fi

if [[ -d "$SRC/data" ]]; then rm -rf data && cp -R "$SRC/data" data && ok "datastore restored"; fi
if [[ -d "$SRC/uploads" ]]; then rm -rf uploads && cp -R "$SRC/uploads" uploads && ok "uploads restored"; fi

if [[ -f "$SRC/postgres.sql" ]]; then
  if docker compose -f docker/docker-compose.yml ps --status running --quiet postgres 2>/dev/null | grep -q .; then
    docker compose -f docker/docker-compose.yml exec -T postgres \
      psql -U "${POSTGRES_USER:-wangstore}" -d "${POSTGRES_DB:-wangstore}" < "$SRC/postgres.sql" >/dev/null
    ok "database restored"
  elif require_cmd psql; then
    psql wangstore < "$SRC/postgres.sql" >/dev/null && ok "database restored"
  else
    warn "PostgreSQL dump present but no client available; restore manually from $SRC/postgres.sql"
  fi
fi

log "Restarting services"
if docker compose -f docker/docker-compose.yml ps --quiet 2>/dev/null | grep -q .; then
  docker compose -f docker/docker-compose.yml --env-file .env restart app
elif require_cmd pm2; then
  pm2 reload ecosystem.config.js --update-env
fi

if wait_for_health "http://127.0.0.1:3000/api/health" 30; then
  ok "Restore complete and healthy"
else
  warn "Service did not report healthy — check logs; a pre-restore snapshot is in backups/pre-restore"
fi
