#!/usr/bin/env bash
set -euo pipefail

API="${API:-https://agritech-api.mst.co.zw}"
CURL="/usr/bin/curl"
EMAIL="${ADMIN_EMAIL:-info@mst.co.zw}"
PASSWORD="${ADMIN_PASSWORD:?Set ADMIN_PASSWORD}"

TOKEN=$("$CURL" -s -X POST "$API/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

count() {
  local path="$1"
  "$CURL" -s -H "Authorization: Bearer $TOKEN" "$API/api/v1/$path?page=0&size=1" \
    | python3 -c "
import sys,json
d=json.load(sys.stdin)
if isinstance(d, dict) and 'totalElements' in d:
    print(d['totalElements'])
elif isinstance(d, list):
    print(len(d))
else:
    print('ok')
"
}

echo "Production API: $API"
for p in farmers buyers orders payments shipments marketplace/products reports roles logistics/companies dashboard/kpis analytics/summary; do
  echo "$p: $(count "$p")"
done
