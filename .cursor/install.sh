#!/usr/bin/env bash
# Idempotent bootstrap for the MST Agritech monorepo.
# Runs after the repository is checked out. Safe to run repeatedly.
#
# Provisions everything the dev stack needs on top of the default base image:
#   - System packages: Maven, PostgreSQL 16, Redis
#   - PostgreSQL role/database (agritech / agritech_db on port 5433)
#   - Frontend + notification-service npm dependencies
#   - Spring Boot core-api build
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PG_PORT=5433

echo "==> Ensuring system packages (maven, postgresql, redis)"
NEEDED=()
command -v mvn          >/dev/null 2>&1 || NEEDED+=(maven)
command -v psql         >/dev/null 2>&1 || NEEDED+=(postgresql postgresql-contrib)
command -v redis-server >/dev/null 2>&1 || NEEDED+=(redis-server)
if [ "${#NEEDED[@]}" -gt 0 ]; then
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y "${NEEDED[@]}"
fi

PG_VER="$(ls /etc/postgresql 2>/dev/null | sort -n | tail -1)"
PG_CONF="/etc/postgresql/${PG_VER}/main/postgresql.conf"

echo "==> Configuring PostgreSQL ${PG_VER} on port ${PG_PORT}"
if [ -f "$PG_CONF" ]; then
  sudo sed -i "s/^#\?port = .*/port = ${PG_PORT}/" "$PG_CONF"
fi
sudo pg_ctlcluster "$PG_VER" main start 2>/dev/null || true

echo "==> Waiting for PostgreSQL to accept connections"
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -p "$PG_PORT" >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Ensuring database role and schema exist"
if ! sudo -u postgres psql -p "$PG_PORT" -tAc "SELECT 1 FROM pg_roles WHERE rolname='agritech'" | grep -q 1; then
  sudo -u postgres psql -p "$PG_PORT" -c "CREATE ROLE agritech LOGIN PASSWORD 'agritech_pass';"
fi
if ! sudo -u postgres psql -p "$PG_PORT" -tAc "SELECT 1 FROM pg_database WHERE datname='agritech_db'" | grep -q 1; then
  sudo -u postgres createdb -p "$PG_PORT" -O agritech agritech_db
fi

echo "==> Installing frontend dependencies"
( cd frontend && npm ci )

echo "==> Installing notification-service dependencies"
( cd backend/notification-service && npm ci )

echo "==> Building core-api (Spring Boot)"
( cd backend/core-api && mvn -q -DskipTests package )

echo "==> install.sh complete"
