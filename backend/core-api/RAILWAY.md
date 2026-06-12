# Railway — `mst-agritech-api`

Config-as-code for the Spring Boot API service.

## One-time dashboard setup

| Setting | Value |
|---------|--------|
| **Service name** | `mst-agritech-api` |
| **Root Directory** | `backend/core-api` |
| **Config-as-code file** | `/backend/core-api/railway.json` |
| **Builder** | Dockerfile (from `railway.json`) |

Link **Postgres** and **Redis** in the same project (names `Postgres` and `Redis` recommended).

## Config files in this folder

| File | Purpose |
|------|---------|
| `railway.json` | Build, healthcheck, restart policy, watch patterns |
| `.railway/variables.env` | Variable template for Raw Editor |
| `Dockerfile` | Multi-stage Java 17 build |
| `scripts/railway-setup.sh` | CLI helper to set secrets |

## Variables (minimum required)

The app **auto-wires** Postgres (`DATABASE_URL`, `PG*`) and Redis (`REDIS*`) and listens on Railway `PORT`.

You only need to set:

```env
JWT_SECRET=<openssl rand -hex 32>
JASYPT_PASSWORD=<openssl rand -hex 32>
FRONTEND_URL=https://agritech.mst.co.zw
API_BASE_URL=https://agritech-api.mst.co.zw
```

Copy from `.railway/variables.env` into **Variables → Raw Editor**.

If `API_BASE_URL` is omitted, the app defaults to `https://${RAILWAY_PUBLIC_DOMAIN}` when deployed on Railway.

## Custom domain

1. **Networking** → **Custom Domain** → `agritech-api.mst.co.zw`
2. DNS: **CNAME** `agritech-api` → Railway target
3. Set `API_BASE_URL=https://agritech-api.mst.co.zw` and redeploy

## CLI quick setup

```bash
npm i -g @railway/cli
railway login
cd backend/core-api
railway link          # select project + mst-agritech-api service
./scripts/railway-setup.sh
railway up
```

## Verify deploy

```bash
curl https://agritech-api.mst.co.zw/actuator/health
curl https://agritech-api.mst.co.zw/api-docs
```

## Vercel frontend

```env
VITE_API_BASE_URL=https://agritech-api.mst.co.zw/api/v1
VITE_OPENAPI_URL=https://agritech-api.mst.co.zw/api-docs
```

Redeploy Vercel after changing env vars.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Healthcheck timeout | Check deploy logs for Flyway/DB errors; confirm Postgres is running |
| Empty `DB_HOST` | Delete blank `DB_HOST` var; rely on `PG*` / `DATABASE_URL` auto-map |
| Wrong port | Remove manual `SERVER_PORT`; Railway `PORT` is used automatically |
| CORS errors | `FRONTEND_URL` must match your frontend origin (`*.mst.co.zw` allowed) |
