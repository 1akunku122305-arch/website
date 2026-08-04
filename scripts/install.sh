#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# WangStore — one-command installer
#
#   bash scripts/install.sh                 # interactive
#   bash scripts/install.sh --docker        # containerised stack
#   bash scripts/install.sh --bare          # Node + PM2 on the host
#   bash scripts/install.sh --domain wangstore.id --email admin@wangstore.id
#
# Installs dependencies, Docker, PostgreSQL, Redis, Nginx, SSL, runs
# migrations, starts services, and performs a health check.
# ---------------------------------------------------------------------------
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ROOT="$(repo_root)"
cd "$ROOT"

MODE=""
DOMAIN=""
SSL_EMAIL=""
SKIP_SSL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker) MODE=docker; shift ;;
    --bare)   MODE=bare; shift ;;
    --domain) DOMAIN="${2:-}"; shift 2 ;;
    --email)  SSL_EMAIL="${2:-}"; shift 2 ;;
    --skip-ssl) SKIP_SSL=1; shift ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) die "Unknown option: $1" ;;
  esac
done

banner
log "Starting installation"

# --- 1. Detect platform -----------------------------------------------------
OS="$(uname -s)"
if [[ -f /etc/os-release ]]; then . /etc/os-release; DISTRO="${ID:-unknown}"; else DISTRO="$OS"; fi
ok "Platform: $OS ($DISTRO)"

SUDO=""
if [[ "$(id -u)" -ne 0 ]] && require_cmd sudo; then SUDO="sudo"; fi

pkg_install() {
  if require_cmd apt-get; then
    $SUDO apt-get update -qq && $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$@"
  elif require_cmd dnf; then $SUDO dnf install -y -q "$@"
  elif require_cmd yum; then $SUDO yum install -y -q "$@"
  elif require_cmd apk; then $SUDO apk add --no-cache "$@"
  elif require_cmd brew; then brew install "$@"
  else warn "No supported package manager found; install manually: $*"; fi
}

# --- 2. Base dependencies ---------------------------------------------------
log "Checking base dependencies"
for tool in curl git openssl; do
  if require_cmd "$tool"; then ok "$tool present"; else log "Installing $tool"; pkg_install "$tool"; fi
done

# --- 3. Choose installation mode -------------------------------------------
if [[ -z "$MODE" ]]; then
  if require_cmd docker; then MODE=docker; else MODE=bare; fi
  log "Auto-selected mode: $MODE (override with --docker or --bare)"
fi

# --- 4. Environment ---------------------------------------------------------
if [[ ! -f .env ]]; then
  log "Creating .env from .env.example"
  cp .env.example .env
  SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  DBPASS="$(openssl rand -hex 16)"
  OWNERPASS="$(openssl rand -base64 12 | tr -d '/+=' | cut -c1-14)"
  # Portable in-place edit (GNU and BSD sed).
  sed_i() { sed "$1" .env > .env.tmp && mv .env.tmp .env; }
  sed_i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|"
  sed_i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DBPASS}|"
  sed_i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://wangstore:${DBPASS}@postgres:5432/wangstore?schema=public|"
  sed_i "s|^WANGSTORE_OWNER_PASSWORD=.*|WANGSTORE_OWNER_PASSWORD=${OWNERPASS}|"
  [[ -n "$DOMAIN" ]] && sed_i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://${DOMAIN}|"
  ok "Secrets generated"
  printf '\n  %sInitial owner password: %s%s\n\n' "$YELLOW" "$OWNERPASS" "$NC"
else
  ok ".env already present (left untouched)"
fi

mkdir -p data uploads logs
ok "Data directories ready"

install_docker() {
  if require_cmd docker; then ok "Docker present"; return; fi
  log "Installing Docker Engine"
  curl -fsSL https://get.docker.com | $SUDO sh
  $SUDO systemctl enable --now docker 2>/dev/null || true
  ok "Docker installed"
}

# --- 5a. Docker path --------------------------------------------------------
if [[ "$MODE" == "docker" ]]; then
  install_docker
  log "Building and starting the stack (app, PostgreSQL, Redis, Nginx)"
  docker compose -f docker/docker-compose.yml --env-file .env up -d --build
  ok "Containers started"
  log "PostgreSQL schema applied automatically on first boot (database/schema.sql)"
fi

# --- 5b. Bare-metal path ----------------------------------------------------
if [[ "$MODE" == "bare" ]]; then
  if ! require_cmd node; then
    log "Installing Node.js 22 LTS"
    curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO -E bash - 2>/dev/null || warn "NodeSource unavailable; install Node 22 manually"
    pkg_install nodejs
  fi
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  [[ "$NODE_MAJOR" -ge 20 ]] || die "Node.js 20+ is required (found $(node -v 2>/dev/null || echo none))"
  ok "Node $(node -v)"

  log "Installing PostgreSQL and Redis"
  pkg_install postgresql redis || warn "Install PostgreSQL/Redis manually if the names differ on your distro"
  $SUDO systemctl enable --now postgresql 2>/dev/null || true
  $SUDO systemctl enable --now redis 2>/dev/null || $SUDO systemctl enable --now redis-server 2>/dev/null || true

  if require_cmd psql; then
    log "Configuring the wangstore database"
    $SUDO -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='wangstore'" | grep -q 1 || \
      $SUDO -u postgres psql -c "CREATE ROLE wangstore LOGIN PASSWORD '$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)';"
    $SUDO -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='wangstore'" | grep -q 1 || \
      $SUDO -u postgres psql -c "CREATE DATABASE wangstore OWNER wangstore;"
    $SUDO -u postgres psql -d wangstore -f database/schema.sql >/dev/null
    ok "Database migrated"
  fi

  log "Installing Node dependencies"
  npm ci --omit=dev --no-audit --no-fund || npm install --no-audit --no-fund
  log "Building the application"
  npm run build

  log "Installing Nginx"
  pkg_install nginx || true
  if [[ -d /etc/nginx ]]; then
    $SUDO cp nginx/proxy-params.conf /etc/nginx/proxy-params.conf
    $SUDO cp nginx/wangstore.conf /etc/nginx/conf.d/wangstore.conf
    $SUDO sed -i 's|server app:3000|server 127.0.0.1:3000|' /etc/nginx/conf.d/wangstore.conf
    [[ -n "$DOMAIN" ]] && $SUDO sed -i "s|wangstore.id|${DOMAIN}|g" /etc/nginx/conf.d/wangstore.conf
    ok "Nginx configured"
  fi

  if ! require_cmd pm2; then log "Installing PM2"; $SUDO npm install -g pm2; fi
  log "Starting the application with PM2"
  pm2 start ecosystem.config.js --update-env
  pm2 save
  pm2 startup 2>/dev/null | tail -1 | grep -q sudo && warn "Run the printed 'pm2 startup' command to enable boot persistence"
  ok "Application running under PM2"
fi

# --- 6. SSL -----------------------------------------------------------------
if [[ -n "$DOMAIN" && "$SKIP_SSL" -eq 0 ]]; then
  log "Requesting Let's Encrypt certificate for $DOMAIN"
  require_cmd certbot || pkg_install certbot
  if require_cmd certbot; then
    $SUDO certbot certonly --standalone --non-interactive --agree-tos \
      -d "$DOMAIN" -d "www.$DOMAIN" \
      ${SSL_EMAIL:+--email "$SSL_EMAIL"} ${SSL_EMAIL:---register-unsafely-without-email} || \
      warn "Certificate request failed — point DNS at this server and re-run"
    $SUDO nginx -t 2>/dev/null && $SUDO systemctl reload nginx 2>/dev/null || true
  fi
else
  warn "SSL skipped (pass --domain to provision a certificate)"
fi

# --- 7. Health check --------------------------------------------------------
log "Waiting for the health endpoint"
if wait_for_health "http://127.0.0.1:3000/api/health" 40; then
  ok "Health check passed"
  curl -fsS http://127.0.0.1:3000/api/health || true
  printf '\n'
else
  die "Health check failed — inspect logs with 'docker compose -f docker/docker-compose.yml logs -f' or 'pm2 logs wangstore'"
fi

printf '\n'
ok "WangStore installed successfully"
log "Site:      http://127.0.0.1:3000${DOMAIN:+  (https://$DOMAIN)}"
log "Dashboard: /login  — sign in and change the owner password immediately"
