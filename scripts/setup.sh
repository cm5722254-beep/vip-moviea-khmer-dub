#!/usr/bin/env bash
# =============================================================================
# អាធិរាជរឿង — Initial Setup Script (Linux/macOS)
# =============================================================================
# Usage:
#   bash scripts/setup.sh             — interactive setup
#   bash scripts/setup.sh --seed-admin — also seed first admin account
# =============================================================================

set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*" >&2; }
header()  { echo -e "\n${BOLD}${BLUE}══════════════════════════════════════${NC}"; echo -e "${BOLD}${BLUE}  $*${NC}"; echo -e "${BOLD}${BLUE}══════════════════════════════════════${NC}"; }

# ── Script directory (works regardless of where it's called from) ─────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Args ──────────────────────────────────────────────────────────────────────
SEED_ADMIN=false
for arg in "$@"; do
  case $arg in
    --seed-admin) SEED_ADMIN=true ;;
    --help|-h)
      echo "Usage: $0 [--seed-admin]"
      echo "  --seed-admin   Seed the first admin account after containers start"
      exit 0
      ;;
  esac
done

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}  ███████╗███████╗████████╗██╗   ██╗██████╗ ${NC}"
echo -e "${BOLD}${CYAN}  ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗${NC}"
echo -e "${BOLD}${CYAN}  ███████╗█████╗     ██║   ██║   ██║██████╔╝${NC}"
echo -e "${BOLD}${CYAN}  ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ ${NC}"
echo -e "${BOLD}${CYAN}  ███████║███████╗   ██║   ╚██████╔╝██║     ${NC}"
echo -e "${BOLD}${CYAN}  ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ${NC}"
echo ""
echo -e "${BOLD}  អាធិរាជរឿង — Initial Setup${NC}"
echo ""

# ── Check prerequisites ───────────────────────────────────────────────────────
header "Checking Prerequisites"

check_command() {
  if command -v "$1" &>/dev/null; then
    success "$1 found: $(command -v "$1")"
  else
    error "$1 is not installed or not in PATH"
    echo "  Install instructions: $2"
    exit 1
  fi
}

check_command docker   "https://docs.docker.com/engine/install/"
check_command openssl  "sudo apt install openssl"

# Docker Compose v2
if docker compose version &>/dev/null; then
  success "docker compose (v2) found"
else
  error "Docker Compose v2 not found"
  echo "  Install Docker Engine 24+ which includes Compose v2"
  exit 1
fi

# ── Create .env from example ──────────────────────────────────────────────────
header "Environment Configuration"

ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.docker.example"

if [[ ! -f "$ENV_EXAMPLE" ]]; then
  error ".env.docker.example not found at $ENV_EXAMPLE"
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  warn ".env already exists — skipping copy"
  warn "Delete $ENV_FILE and re-run if you want a fresh config"
else
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  success "Created .env from .env.docker.example"
fi

# ── Generate JWT secrets ───────────────────────────────────────────────────────
header "Generating Secrets"

# Only replace placeholder values
replace_if_placeholder() {
  local key="$1"
  local new_value="$2"
  local file="$3"
  # Check if value still contains CHANGE_ME
  if grep -q "^${key}=.*CHANGE_ME" "$file"; then
    sed -i "s|^${key}=.*|${key}=${new_value}|" "$file"
    success "Generated secret for ${key}"
  else
    info "${key} already set — skipping"
  fi
}

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_ADMIN_SECRET=$(openssl rand -base64 64 | tr -d '\n')
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n/+=' | cut -c1-24)

replace_if_placeholder "JWT_SECRET"          "$JWT_SECRET"          "$ENV_FILE"
replace_if_placeholder "JWT_ADMIN_SECRET"    "$JWT_ADMIN_SECRET"    "$ENV_FILE"
replace_if_placeholder "POSTGRES_PASSWORD"   "$POSTGRES_PASSWORD"   "$ENV_FILE"

# Update DATABASE_URL to match the generated password
if grep -q "CHANGE_ME_STRONG_PASSWORD" "$ENV_FILE"; then
  sed -i "s|CHANGE_ME_STRONG_PASSWORD|${POSTGRES_PASSWORD}|g" "$ENV_FILE"
  success "Updated DATABASE_URL with generated password"
fi

# ── Secure .env file ──────────────────────────────────────────────────────────
chmod 600 "$ENV_FILE"
success "Set .env permissions to 600"

# ── Create required directories ───────────────────────────────────────────────
header "Creating Directories"

mkdir -p "$ROOT_DIR/backend/uploads"
success "Created backend/uploads"

mkdir -p "$ROOT_DIR/logs"
success "Created logs/"

# ── Check for required manual configuration ───────────────────────────────────
header "Configuration Check"

check_env_value() {
  local key="$1"
  local value
  value=$(grep "^${key}=" "$ENV_FILE" | cut -d= -f2-)
  if [[ "$value" == *"CHANGE_ME"* ]] || [[ -z "$value" ]]; then
    warn "${key} is not configured — edit .env before deploying"
    return 1
  else
    success "${key} is set"
    return 0
  fi
}

MISSING=0
check_env_value "TELEGRAM_BOT_TOKEN"   || MISSING=$((MISSING+1))
check_env_value "FRONTEND_URL"          || MISSING=$((MISSING+1))
check_env_value "VITE_API_URL"          || MISSING=$((MISSING+1))

if [[ $MISSING -gt 0 ]]; then
  echo ""
  warn "$MISSING required values not set in .env"
  warn "Edit $ENV_FILE before running: docker compose up -d"
  echo ""
  read -p "Continue anyway? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Exiting. Edit .env and re-run: bash scripts/setup.sh"
    exit 0
  fi
fi

# ── Docker build ──────────────────────────────────────────────────────────────
header "Building Docker Images"

cd "$ROOT_DIR"
info "Building images (this may take a few minutes)..."
docker compose build --no-cache
success "Images built successfully"

# ── Start containers ──────────────────────────────────────────────────────────
header "Starting Containers"

docker compose up -d
success "Containers started"

# ── Wait for health checks ────────────────────────────────────────────────────
header "Waiting for Services"

info "Waiting for PostgreSQL to be healthy..."
RETRIES=30
until docker compose exec -T postgres pg_isready -U "$(grep '^POSTGRES_USER=' "$ENV_FILE" | cut -d= -f2)" &>/dev/null; do
  RETRIES=$((RETRIES-1))
  if [[ $RETRIES -le 0 ]]; then
    error "PostgreSQL did not become healthy in time"
    docker compose logs postgres | tail -20
    exit 1
  fi
  sleep 2
done
success "PostgreSQL is healthy"

info "Waiting for Redis to be healthy..."
RETRIES=15
until docker compose exec -T redis redis-cli ping | grep -q PONG; do
  RETRIES=$((RETRIES-1))
  if [[ $RETRIES -le 0 ]]; then
    error "Redis did not become healthy in time"
    exit 1
  fi
  sleep 2
done
success "Redis is healthy"

info "Waiting for Backend API..."
RETRIES=30
until curl -sf http://localhost:3000/api/v1/health &>/dev/null; do
  RETRIES=$((RETRIES-1))
  if [[ $RETRIES -le 0 ]]; then
    warn "Backend health check timed out — check logs: docker compose logs backend"
    break
  fi
  sleep 3
done
if curl -sf http://localhost:3000/api/v1/health &>/dev/null; then
  success "Backend API is healthy"
fi

# ── Seed admin account ────────────────────────────────────────────────────────
if [[ "$SEED_ADMIN" == true ]]; then
  header "Seeding Admin Account"

  ADMIN_USERNAME=$(grep '^ADMIN_USERNAME=' "$ENV_FILE" | cut -d= -f2-)
  ADMIN_PASSWORD=$(grep '^ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
  ADMIN_EMAIL=$(grep '^ADMIN_EMAIL=' "$ENV_FILE" | cut -d= -f2-)

  if [[ "$ADMIN_PASSWORD" == *"CHANGE_ME"* ]]; then
    error "ADMIN_PASSWORD is not set in .env — skipping admin seed"
  else
    docker compose exec -T backend node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const password = await bcrypt.hash('${ADMIN_PASSWORD}', 12);
  const admin = await prisma.admin.upsert({
    where: { username: '${ADMIN_USERNAME}' },
    update: { password, email: '${ADMIN_EMAIL}' },
    create: {
      username: '${ADMIN_USERNAME}',
      password,
      email: '${ADMIN_EMAIL}',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin ready:', admin.username);
}
main().catch(console.error).finally(() => prisma.\$disconnect());
"
    success "Admin account seeded: $ADMIN_USERNAME"
  fi
fi

# ── Final summary ─────────────────────────────────────────────────────────────
header "Setup Complete!"

echo -e "${GREEN}Services running:${NC}"
docker compose ps

echo ""
echo -e "${BOLD}Access points:${NC}"
echo -e "  Frontend :  ${CYAN}http://localhost${NC}"
echo -e "  Backend  :  ${CYAN}http://localhost:3000${NC}"
echo -e "  Health   :  ${CYAN}http://localhost:3000/api/v1/health${NC}"
echo -e "  Admin    :  ${CYAN}http://localhost/admin${NC}"
echo ""
echo -e "${BOLD}Useful commands:${NC}"
echo -e "  ${YELLOW}docker compose logs -f${NC}          — watch all logs"
echo -e "  ${YELLOW}docker compose logs -f backend${NC}  — backend logs only"
echo -e "  ${YELLOW}docker compose ps${NC}               — service status"
echo -e "  ${YELLOW}docker compose down${NC}             — stop all services"
echo ""
success "Done! See DEPLOYMENT.md for full production configuration."
