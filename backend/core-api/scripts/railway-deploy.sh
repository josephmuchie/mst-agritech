#!/usr/bin/env bash
# Full Railway CLI workflow for mst-agritech-api.
# Run from backend/core-api: ./scripts/railway-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# confident-clarity project (update if you create a new project)
PROJECT_ID="${RAILWAY_PROJECT_ID:-06777b19-a124-45f1-a0b4-651c33f883cf}"
SERVICE="${RAILWAY_SERVICE:-mst-agritech-api}"
ENVIRONMENT="${RAILWAY_ENVIRONMENT:-production}"

die() { echo "Error: $*" >&2; exit 1; }

command -v railway >/dev/null 2>&1 || die "Install CLI: npm i -g @railway/cli"

echo "==> Checking Railway auth..."
if ! railway whoami >/dev/null 2>&1; then
  echo "Not logged in. Opening browser login..."
  railway login || die "Login failed. Run: railway login"
fi
echo "Logged in as: $(railway whoami)"

echo ""
echo "==> Linking project $PROJECT_ID / service $SERVICE..."
railway link -p "$PROJECT_ID" -s "$SERVICE" -e "$ENVIRONMENT"

echo ""
echo "==> Ensuring GitHub repo is connected (monorepo root + railway.json)..."
railway service source connect --repo josephmuchie/mst-agritech --branch main --service "$SERVICE" 2>/dev/null || true

echo ""
echo "==> Setting application variables..."
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
JASYPT_PASSWORD="${JASYPT_PASSWORD:-$(openssl rand -hex 32)}"
FRONTEND_URL="${FRONTEND_URL:-https://agritech.mst.co.zw}"
API_BASE_URL="${API_BASE_URL:-https://agritech-api.mst.co.zw}"
API_PUBLIC_URL="${API_PUBLIC_URL:-https://agritech-api.mst.co.zw}"

railway variable set \
  JWT_SECRET="$JWT_SECRET" \
  JASYPT_PASSWORD="$JASYPT_PASSWORD" \
  FRONTEND_URL="$FRONTEND_URL" \
  API_BASE_URL="$API_BASE_URL" \
  API_PUBLIC_URL="$API_PUBLIC_URL" \
  'DB_HOST=${{mst-agritech-db.PGHOST}}' \
  'DB_PORT=${{mst-agritech-db.PGPORT}}' \
  'DB_NAME=${{mst-agritech-db.PGDATABASE}}' \
  'DB_USER=${{mst-agritech-db.PGUSER}}' \
  'DB_PASSWORD=${{mst-agritech-db.PGPASSWORD}}' \
  'REDIS_HOST=${{mst-agritech-redis.REDISHOST}}' \
  'REDIS_PORT=${{mst-agritech-redis.REDISPORT}}' \
  'REDIS_PASSWORD=${{mst-agritech-redis.REDISPASSWORD}}' \
  --service "$SERVICE" \
  --environment "$ENVIRONMENT" \
  --skip-deploys

echo ""
echo "==> Removing SERVER_PORT if set..."
railway variable delete SERVER_PORT --service "$SERVICE" --environment "$ENVIRONMENT" 2>/dev/null || true

echo ""
echo "==> Triggering deploy from GitHub (uses /railway.json monorepo config)..."
railway redeploy -s "$SERVICE" -y

echo ""
echo "==> Deployment started. Watch logs:"
echo "    railway logs -s $SERVICE"
echo ""
echo "Verify when healthy:"
echo "    curl https://agritech-api.mst.co.zw/actuator/health"
