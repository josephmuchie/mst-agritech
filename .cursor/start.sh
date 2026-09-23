#!/usr/bin/env bash
# Per-boot startup: bring up PostgreSQL and Redis, then return.
# Idempotent and safe to run on every environment start.
set -euo pipefail

PG_PORT=5433

echo "==> Starting PostgreSQL"
sudo pg_ctlcluster 16 main start 2>/dev/null || true
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -p "$PG_PORT" >/dev/null 2>&1; then
    echo "    PostgreSQL is ready on port ${PG_PORT}"
    break
  fi
  sleep 1
done

echo "==> Starting Redis"
if ! redis-cli ping >/dev/null 2>&1; then
  sudo redis-server --daemonize yes --dir /tmp
fi
for _ in $(seq 1 15); do
  if redis-cli ping >/dev/null 2>&1; then
    echo "    Redis is ready on port 6379"
    break
  fi
  sleep 1
done

echo "==> start.sh complete"
