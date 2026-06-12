# Backend Deployment Guide (Docker)

The MST Agritech backend is a **Spring Boot** API that runs in Docker with **PostgreSQL** and **Redis**.  
Vercel hosts only the frontend — deploy the backend to a **container-friendly** platform.

---

## Architecture

```
┌─────────────────┐      HTTPS       ┌──────────────────────────────┐
│  Vercel         │  ──────────────► │  Backend host (this guide)    │
│  React frontend │                  │  ┌──────────┐  ┌───────────┐ │
│                 │                  │  │ core-api │  │ postgres  │ │
│  VITE_API_      │                  │  │ :8081    │──│ redis     │ │
│  BASE_URL       │                  │  └──────────┘  └───────────┘ │
└─────────────────┘                  └──────────────────────────────┘
```

---

## Recommended platforms

| Platform | Best for | Docker Compose | Managed Postgres | Free tier |
|----------|----------|----------------|------------------|-----------|
| **[Railway](https://railway.app)** | Fastest start | Yes | Yes | Limited |
| **[Render](https://render.com)** | Simple + stable | Dockerfile | Yes | Yes (with limits) |
| **[Fly.io](https://fly.io)** | Global edge | Yes | Add-on | Limited |
| **[DigitalOcean](https://www.digitalocean.com)** | Full control | Droplet + compose | Managed DB option | No |
| **AWS ECS / GCP Cloud Run** | Enterprise | Yes | RDS / Cloud SQL | No |

---

## Option 1: Railway (recommended — easiest)

Railway runs your `docker-compose.yml` services with minimal setup.

### Steps

1. **Sign up** at [railway.app](https://railway.app) and connect your GitHub repo.

2. **Create a new project** → **Deploy from GitHub** → select `mst-agritech`.

3. **Add PostgreSQL**  
   - New → Database → PostgreSQL  
   - Note the connection variables (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`).

4. **Add Redis**  
   - New → Database → Redis  
   - Note `REDIS_URL` or host/port.

5. **Deploy core-api**  
   - New → GitHub Repo → set **Root Directory** to `backend/core-api`  
   - Or deploy the whole repo with Docker Compose (Railway supports compose).

6. **Set environment variables** on the `core-api` service:

   ```env
   DB_HOST=<postgres-host>
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=<from-railway>
   REDIS_HOST=<redis-host>
   REDIS_PORT=6379
   JWT_SECRET=<generate-64+-char-random-string>
   JASYPT_PASSWORD=<generate-random-string>
   SERVER_PORT=8081
   FRONTEND_URL=https://your-app.vercel.app
   API_BASE_URL=https://your-api.up.railway.app
   ```

7. **Generate a public domain**  
   - Service → Settings → Networking → Generate Domain  
   - Example: `https://mst-agritech-api.up.railway.app`

8. **Point Vercel frontend** to the API:

   ```env
   VITE_API_BASE_URL=https://mst-agritech-api.up.railway.app/api/v1
   VITE_OPENAPI_URL=https://mst-agritech-api.up.railway.app/api-docs
   ```

9. **Redeploy Vercel** after setting env vars.

### Flyway migrations

Migrations run automatically on startup (`spring.flyway.enabled=true`).  
First deploy may take 1–2 minutes while Postgres initializes.

---

## Option 2: Render

### A. Using `render.yaml` (Infrastructure as Code)

This repo includes `render.yaml` at the root. To use it:

1. Go to [render.com](https://render.com) → **New** → **Blueprint**  
2. Connect the GitHub repo — Render reads `render.yaml`  
3. Set secret env vars in the dashboard when prompted:
   - `JWT_SECRET`
   - `JASYPT_PASSWORD`
   - `FRONTEND_URL` (your Vercel URL)

4. After deploy, copy the API URL and set Vercel env vars (same as Railway step 8).

### B. Manual web service

1. **New → PostgreSQL** — note internal connection string.  
2. **New → Key Value (Redis)** — note connection URL.  
3. **New → Web Service**:
   - Build: Docker  
   - Dockerfile path: `backend/core-api/Dockerfile`  
   - Root directory: `backend/core-api`  
   - Port: `8081`  
   - Health check path: `/actuator/health`

4. Add all environment variables from the Railway section above.

---

## Option 3: Fly.io

```bash
# Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
cd backend/core-api
fly launch --no-deploy

# Create Postgres
fly postgres create --name mst-agritech-db
fly postgres attach mst-agritech-db

# Create Redis (Upstash via fly or external)
fly secrets set JWT_SECRET="your-long-secret" JASYPT_PASSWORD="your-jasypt-pass"
fly secrets set FRONTEND_URL="https://your-app.vercel.app"
fly secrets set SERVER_PORT=8081

fly deploy
```

Set `fly.toml` HTTP service `internal_port = 8081`.

---

## Option 4: VPS (DigitalOcean / Hetzner / AWS EC2)

For full control, run Docker Compose on a Linux server.

### On the server

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone repo
git clone https://github.com/josephmuchie/mst-agritech.git
cd mst-agritech

# Create production env file
cp .env.example .env
nano .env   # set strong passwords and JWT_SECRET

# Start API stack (postgres + redis + core-api)
docker compose -f docker-compose.prod.yml up -d --build

# Check health
curl http://localhost:8081/actuator/health
```

### Reverse proxy (HTTPS with Caddy)

```bash
# Install Caddy, then /etc/caddy/Caddyfile:
api.mstagritech.co.zw {
    reverse_proxy localhost:8081
}
```

Point DNS `api.mstagritech.co.zw` → server IP.

---

## Required environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Postgres hostname | `postgres` (compose) or managed host |
| `DB_PORT` | Postgres port | `5432` |
| `DB_NAME` | Database name | `agritech_db` |
| `DB_USER` | Database user | `agritech` |
| `DB_PASSWORD` | Database password | strong random |
| `REDIS_HOST` | Redis hostname | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing key (64+ chars) | random string |
| `JASYPT_PASSWORD` | Encrypts integration secrets | random string |
| `SERVER_PORT` | API listen port | `8081` |
| `FRONTEND_URL` | Vercel URL (SSO redirects, CORS) | `https://app.vercel.app` |
| `API_BASE_URL` | Public API URL (SSO mock/OIDC callbacks) | `https://api.example.com` |

---

## Post-deploy checklist

- [ ] `GET https://your-api/actuator/health` returns `{"status":"UP"}`
- [ ] `GET https://your-api/api-docs` returns OpenAPI JSON
- [ ] Vercel `VITE_API_BASE_URL` points to `https://your-api/api/v1`
- [ ] Login works from the Vercel frontend
- [ ] SSO redirect URI registered: `https://your-vercel-app/login/sso/callback`
- [ ] CORS allows your Vercel domain (already includes `*.vercel.app`)

---

## Local Docker (development)

```bash
# From repo root
cp .env.example .env
docker compose up -d --build

# API: http://localhost:8081
# Postgres: localhost:5433
# Redis: localhost:6379
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Flyway migration fails | Check Postgres is healthy; wipe volume only in dev |
| 502 from platform | Verify `SERVER_PORT=8081` matches health check port |
| CORS errors from Vercel | Set `FRONTEND_URL`; backend allows `*.vercel.app` |
| SSO redirect wrong host | Set `API_BASE_URL` to public API URL |
| DB connection refused | Use internal hostname on managed platforms, not `localhost` |

---

## What NOT to use

- **Vercel** — no Docker, no long-running Java process  
- **Netlify** — frontend only  
- **GitHub Pages** — static only  

Use Vercel for the frontend and any platform above for the Docker backend.
