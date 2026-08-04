#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# WangStore — backup
#   bash scripts/backup.sh [--output DIR] [--keep N] [--quiet]
# Archives the JSON datastore, uploads, .env, and a PostgreSQL dump when the
# database is reachable. Retains the newest N archives (default 14).
# ---------------------------------------------------------------------------
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ROOT="$(repo_root)"; cd "$ROOT"

OUT_DIR="$ROOT/backups"
KEEP=14
QUIET=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --output) OUT_DIR="${2:?}"; shift 2 ;;
    --keep)   KEEP="${2:?}"; shift 2 ;;
    --quiet)  QUIET=1; shift ;;
    *) die "Unknown option: $1" ;;
  esac
done
[[ "$QUIET" -eq 1 ]] || banner

STAMP="$(date +%Y%m%d-%H%M%S)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$OUT_DIR" "$STAGE/wangstore"

log "Collecting application data"
[[ -d data ]]    && cp -R data    "$STAGE/wangstore/" && ok "datastore"
[[ -d uploads ]] && cp -R uploads "$STAGE/wangstore/" && ok "uploads"
[[ -f .env ]]    && cp .env       "$STAGE/wangstore/env.backup" && ok "environment"

if docker compose -f docker/docker-compose.yml ps --status running --quiet postgres 2>/dev/null | grep -q .; then
  log "Dumping PostgreSQL"
  docker compose -f docker/docker-compose.yml exec -T postgres \
    pg_dump -U "${POSTGRES_USER:-wangstore}" "${POSTGRES_DB:-wangstore}" \
    > "$STAGE/wangstore/postgres.sql" 2>/dev/null && ok "database dump" || warn "database dump skipped"
elif require_cmd pg_dump && pg_isready -q 2>/dev/null; then
  pg_dump wangstore > "$STAGE/wangstore/postgres.sql" 2>/dev/null && ok "database dump" || warn "database dump skipped"
fi

git rev-parse HEAD > "$STAGE/wangstore/REVISION" 2>/dev/null || true
date -u +%Y-%m-%dT%H:%M:%SZ > "$STAGE/wangstore/CREATED_AT"

ARCHIVE="$OUT_DIR/wangstore-$STAMP.tar.gz"
tar -czf "$ARCHIVE" -C "$STAGE" wangstore
chmod 600 "$ARCHIVE"
ok "Backup written: $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"

log "Pruning old archives (keeping $KEEP)"
ls -1t "$OUT_DIR"/wangstore-*.tar.gz 2>/dev/null | tail -n "+$((KEEP + 1))" | while read -r old; do
  rm -f "$old"; ok "removed $(basename "$old")"
done
