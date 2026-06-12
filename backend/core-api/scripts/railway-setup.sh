#!/usr/bin/env bash
# Configure mst-agritech-api variables on Railway via CLI.
# Prerequisites: railway login && railway link (from backend/core-api)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v railway >/dev/null 2>&1; then
  echo "Install Railway CLI: npm i -g @railway/cli"
  exit 1
fi

JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
JASYPT_PASSWORD="${JASYPT_PASSWORD:-$(openssl rand -hex 32)}"
FRONTEND_URL="${FRONTEND_URL:-https://agritech.mst.co.zw}"
API_BASE_URL="${API_BASE_URL:-https://agritech-api.mst.co.zw}"

echo "Setting variables on linked Railway service..."
railway variables set \
  JWT_SECRET="$JWT_SECRET" \
  JASYPT_PASSWORD="$JASYPT_PASSWORD" \
  FRONTEND_URL="$FRONTEND_URL" \
  API_BASE_URL="$API_BASE_URL"

echo ""
echo "Done. Optional explicit DB/Redis refs (if auto-detect fails):"
echo "  railway variables set DB_HOST='\${{Postgres.PGHOST}}' DB_PORT='\${{Postgres.PGPORT}}' ..."
echo ""
echo "Deploy: railway up"
echo "Logs:   railway logs"
