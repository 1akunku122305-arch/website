#!/usr/bin/env bash
# Shared helpers for WangStore operational scripts.
set -euo pipefail

RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'; PURPLE=$'\033[0;35m'; NC=$'\033[0m'

log()   { printf '%s[wangstore]%s %s\n' "$PURPLE" "$NC" "$*"; }
ok()    { printf '%s  ✓%s %s\n' "$GREEN" "$NC" "$*"; }
warn()  { printf '%s  !%s %s\n' "$YELLOW" "$NC" "$*"; }
die()   { printf '%s  ✗%s %s\n' "$RED" "$NC" "$*" >&2; exit 1; }

require_cmd() { command -v "$1" >/dev/null 2>&1; }

banner() {
  printf '%s' "$PURPLE"
  cat <<'ART'
 __      __                 _____ _
 \ \    / /__ _ _ _  __ _  / ____| |_ ___ _ _ ___
  \ \/\/ / _` | ' \/ _` | \___ \| __/ _ \ '_/ -_)
   \_/\_/\__,_|_||_\__, | |____/ \__\___/_| \___|
                   |___/     Build Your Own Server.
ART
  printf '%s\n' "$NC"
}

# Resolve the repository root regardless of the caller's working directory.
repo_root() { cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd; }

wait_for_health() {
  local url="$1" attempts="${2:-30}" i
  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then return 0; fi
    sleep 2
  done
  return 1
}
