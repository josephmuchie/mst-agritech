#!/usr/bin/env bash
set -euo pipefail

API="${API:-http://localhost:8081}"
CURL="/usr/bin/curl"
EMAIL="${ADMIN_EMAIL:-admin@mstagritech.co.zw}"
PASSWORD="${ADMIN_PASSWORD:?Set ADMIN_PASSWORD env var}"

login() {
  "$CURL" -s -X POST "$API/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
}

TOKEN=$(login | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
AUTH=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")

ingest() {
  local type="$1"
  local payload="$2"
  echo ">>> Ingesting $type..."
  "$CURL" -s "${AUTH[@]}" -X POST "$API/api/v1/config/ingestion/api" -d "$payload" | python3 -m json.tool
  echo
}

count() {
  local path="$1"
  "$CURL" -s "${AUTH[@]}" "$API/api/v1/$path?page=0&size=1" | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'totalElements' in d:
  print(d['totalElements'])
elif isinstance(d, list):
  print(len(d))
elif 'content' in d:
  print(len(d['content']))
else:
  print('ok')
"
}

echo "=== Current counts ==="
for p in farmers buyers orders payments shipments marketplace/products reports roles logistics/companies audit-logs; do
  c=$(count "$p" 2>/dev/null || echo "?")
  echo "$p: $c"
done
echo

# Products (unique names)
ingest PRODUCTS '{
  "importType": "PRODUCTS",
  "records": [
    {"name": "Avocados Hass", "category": "Fresh Produce", "unit_of_measure": "KG", "description": "Export-grade Hass avocados", "requires_cold_chain": "Y"},
    {"name": "Macadamia Nuts", "category": "Fresh Produce", "unit_of_measure": "KG", "description": "Shelled macadamia kernels", "requires_cold_chain": "N"},
    {"name": "Blueberries", "category": "Fresh Produce", "unit_of_measure": "KG", "description": "Fresh blueberries for export", "requires_cold_chain": "Y"},
    {"name": "Sorghum Grain", "category": "Grains & Cereals", "unit_of_measure": "TON", "description": "White sorghum for milling", "requires_cold_chain": "N"}
  ]
}'

# Market prices (reference products from V4 + new imports)
ingest MARKET_PRICES '{
  "importType": "MARKET_PRICES",
  "records": [
    {"product_name": "Premium Roses", "price": "2.85", "currency_code": "USD", "country_iso": "NL", "price_source": "AMS Auction"},
    {"product_name": "Beef Sirloin", "price": "8.40", "currency_code": "USD", "country_iso": "AE", "price_source": "Dubai Wholesale"},
    {"product_name": "Avocados Hass", "price": "3.20", "currency_code": "USD", "country_iso": "GB", "price_source": "London Import"},
    {"product_name": "Blueberries", "price": "6.75", "currency_code": "USD", "country_iso": "ZA", "price_source": "Cape Town Market"},
    {"product_name": "Macadamia Nuts", "price": "12.50", "currency_code": "USD", "country_iso": "US", "price_source": "US Retail Index"}
  ]
}'

# Farmers (unique emails)
ingest FARMERS '{
  "importType": "FARMERS",
  "records": [
    {"email": "farmer.ingest1@mstagritech.co.zw", "full_name": "Grace Chikomo", "farm_name": "Chikomo Orchards", "country_iso": "ZW", "province": "Mashonaland West", "total_hectares": "32.5"},
    {"email": "farmer.ingest2@mstagritech.co.zw", "full_name": "Peter Ndlovu", "farm_name": "Ndlovu Cattle Co", "country_iso": "ZW", "province": "Matabeleland North", "total_hectares": "120"},
    {"email": "farmer.ingest3@mstagritech.co.zw", "full_name": "Linda Mutasa", "farm_name": "Mutasa Berry Farm", "country_iso": "ZW", "province": "Manicaland", "total_hectares": "18.75"}
  ]
}'

# Buyers (unique emails)
ingest BUYERS '{
  "importType": "BUYERS",
  "records": [
    {"email": "buyer.ingest1@mstagritech.co.zw", "full_name": "Omar Al Farsi", "company_name": "Gulf Fresh Imports", "country_iso": "AE", "buyer_type": "WHOLESALE", "contact_email": "procurement@gulffresh.ae"},
    {"email": "buyer.ingest2@mstagritech.co.zw", "full_name": "Emma Johansson", "company_name": "Nordic Greens AB", "country_iso": "SE", "buyer_type": "RETAIL", "contact_email": "sourcing@nordicgreens.se"},
    {"email": "buyer.ingest3@mstagritech.co.zw", "full_name": "Michael Chen", "company_name": "Pacific Agro Trading", "country_iso": "CN", "buyer_type": "WHOLESALE", "contact_email": "orders@pacificagro.cn"}
  ]
}'

echo "=== Final counts ==="
for p in farmers buyers orders payments shipments marketplace/products reports roles logistics/companies audit-logs; do
  c=$(count "$p" 2>/dev/null || echo "?")
  echo "$p: $c"
done
