# 🌿 MST Agritech Platform

> **Zimbabwe's Global Agricultural Trade Platform** — connecting local farmers to international buyers for agricultural produce, flowers, and meat products.

---

## Architecture Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["🌐 Browser\n(React 19 + Vite)"]
    end

    subgraph Frontend["Frontend — React + TypeScript"]
        AppLayout["AppLayout\n(Sidebar + Header)"]
        Pages["Pages\nDashboard · Farmers · Buyers\nOrders · Payments · Shipments\nMarketplace · Analytics · Reports\nAdmin (Users · Roles · Audit · Settings)"]
        RTKQuery["RTK Query\nAPI Client"]
        AuthSlice["Auth Slice\n(JWT + Role State)"]
        SSE["SSE Hook\n(Live KPIs)"]
        WS["WebSocket Hook\n(Notifications)"]
    end

    subgraph Gateway["API Gateway (nginx)"]
        Nginx["nginx\n/api/* → core-api:8080\n/ws/*  → notification-service:3001\nSPA fallback"]
    end

    subgraph Backend["Backend — Spring Boot 3 / Java 17"]
        Security["Spring Security 6\nJWT StatelessSession\nRBAC (ADMIN · USER)"]
        Controllers["REST Controllers\nAuth · Users · Farmers · Buyers\nOrders · Dashboard (SSE)\nAuditLogs · MasterData · Roles"]
        Services["Services\nAuthService · FarmerService\nBuyerService · OrderService\nDashboardService"]
        Audit["AuditAspect\n(@Auditable AOP)"]
        Jasper["Jasper Reports\n(PDF / CSV)"]
        Batch["Spring Batch\n(Bulk imports)"]
        Flyway["Flyway Migrations\n(V1__init.sql)"]
    end

    subgraph Notifications["Notification Service — NestJS 10"]
        NestGateway["Socket.io Gateway\nRoom-based subscriptions"]
        BullQueue["Bull Queues\n(order-events\nshipment-events\npayment-events)"]
        HealthCtrl["GET /health"]
    end

    subgraph Data["Data Layer"]
        Postgres[("PostgreSQL 16\nagritech_db\nport 5433")]
        Redis[("Redis 7\nCache + Pub/Sub\nport 6379")]
    end

    subgraph Integrations["External Integrations"]
        DHL["DHL Logistics API"]
        Maersk["Maersk Shipping API"]
        MSC["MSC Shipping API"]
        Stripe["Stripe Payments"]
        PayPal["PayPal Payments"]
        Oracle["Oracle ERP"]
        SAP["SAP ERP"]
        Salesforce["Salesforce CRM"]
    end

    Browser --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Nginx --> Notifications

    Frontend --> AppLayout
    AppLayout --> Pages
    Pages --> RTKQuery
    Pages --> SSE
    Pages --> WS

    RTKQuery -->|"REST /api/v1/*"| Backend
    SSE -->|"GET /api/v1/dashboard/kpis (SSE)"| Backend
    WS -->|"STOMP /ws"| Notifications

    Backend --> Security
    Security --> Controllers
    Controllers --> Services
    Services --> Audit
    Services --> Jasper
    Services --> Batch
    Services --> Flyway
    Services --> Postgres
    Services --> Redis

    Notifications --> NestGateway
    Notifications --> BullQueue
    BullQueue --> Redis

    Backend -->|"Publish events"| Redis
    Redis -->|"Subscribe"| BullQueue

    Services --> DHL
    Services --> Maersk
    Services --> MSC
    Services --> Stripe
    Services --> PayPal
    Services --> Oracle
    Services --> SAP
    Services --> Salesforce
```

---

## Domain Model

```mermaid
erDiagram
    USER ||--o{ FARMER : "has"
    USER ||--o{ BUYER : "has"
    USER }o--o{ ROLE : "assigned"
    ROLE }o--o{ PERMISSION : "grants"

    FARMER ||--o{ ORDER : "fulfils"
    FARMER ||--o{ FARMER_CERTIFICATION : "holds"
    FARMER ||--o{ HARVEST_CALENDAR : "plans"
    FARMER ||--o{ FARMER_MEDIA : "uploads"
    FARMER ||--o{ SUBSCRIPTION : "subscribes"

    BUYER ||--o{ ORDER : "places"

    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER ||--o{ PAYMENT : "paid via"
    ORDER ||--o{ SHIPMENT : "shipped via"
    ORDER ||--o{ QUOTE : "quoted as"

    ORDER_ITEM }o--|| PRODUCT : "references"
    PRODUCT }o--|| PRODUCT_CATEGORY : "belongs to"
    PRODUCT ||--o{ MARKET_PRICE : "priced in"

    SHIPMENT }o--|| LOGISTICS_COMPANY : "handled by"
    SHIPMENT ||--o{ SHIPMENT_TRACKING_EVENT : "tracked via"
    SHIPMENT ||--o{ COMPLIANCE_DOCUMENT : "has"

    SUBSCRIPTION }o--|| SUBSCRIPTION_PLAN : "uses"

    COUNTRY ||--o{ FARMER : "based in"
    COUNTRY ||--o{ BUYER : "based in"
    CURRENCY ||--o{ ORDER : "denominated in"
    CURRENCY ||--o{ EXCHANGE_RATE : "from/to"

    AUDIT_LOG }o--|| USER : "logged by"
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Ant Design 5, Redux Toolkit, RTK Query |
| Backend | Spring Boot 3.2, Java 17, Spring Security 6 (JWT), Flyway, Jasper Reports |
| Notifications | NestJS 10, Socket.io, Bull, ioredis |
| Database | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 |
| Container | Docker Compose |
| CI/CD (planned) | GitHub Actions |

---

## Running Locally

### Prerequisites
- Docker Desktop
- Node 20+
- Java 17+, Maven 3.9+

### 1 — Start infrastructure
```bash
docker compose up -d postgres redis pgadmin
```

### 2 — Start backend
```bash
docker compose up -d core-api
# Swagger UI → http://localhost:8080/swagger-ui.html
```

### 3 — Start notification service
```bash
cd backend/notification-service
npm install
npm run start:dev
# Health → http://localhost:3001/health
```

### 4 — Start frontend dev server
```bash
cd frontend
npm install
npm run dev
# App → http://localhost:5173
```

### Default dev credentials (no backend required)
| Role | Button on Login Page |
|---|---|
| Admin | **Login as Admin** |
| Normal User | **Login as Normal User** |

You can also switch roles at any time via the user menu in the top-right corner.

---

## Project Structure

```
mst-agritech/
├── frontend/                  # React + Vite SPA
│   └── src/
│       ├── features/auth/     # Login, auth slice, RequireAuth guard
│       ├── layouts/           # AppLayout (sidebar + header)
│       ├── pages/             # 17 feature pages + admin sub-pages
│       ├── app/               # Redux store + RTK Query apiSlice
│       └── hooks/             # useSSE, useWebSocket
├── backend/
│   ├── core-api/              # Spring Boot REST API (Maven)
│   │   └── src/main/java/com/mst/agritech/
│   │       ├── controller/    # 9 REST controllers
│   │       ├── service/       # Business logic
│   │       ├── domain/entity/ # 27 JPA entities
│   │       ├── repository/    # Spring Data JPA repos
│   │       ├── security/      # JWT filter, UserDetailsService
│   │       ├── config/        # Security, OpenAPI, WebSocket config
│   │       ├── audit/         # AOP audit logging
│   │       └── exception/     # Global exception handler
│   └── notification-service/  # NestJS real-time service
└── docker-compose.yml
```

---

## API Endpoints

| Method | Path | Access |
|---|---|---|
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/register` | Public |
| GET | `/api/v1/dashboard/kpis` | Authenticated |
| GET | `/api/v1/dashboard/kpis/stream` | Authenticated (SSE) |
| GET/PATCH | `/api/v1/farmers` | Authenticated |
| GET/PATCH | `/api/v1/buyers` | Authenticated |
| GET/PATCH | `/api/v1/orders` | Authenticated |
| GET/PATCH | `/api/v1/users` | ADMIN |
| GET | `/api/v1/roles` | ADMIN |
| GET | `/api/v1/audit-logs` | ADMIN |
| GET | `/api/v1/master-data/countries` | Authenticated |
| GET | `/api/v1/master-data/currencies` | Authenticated |
| GET | `/api/v1/master-data/product-categories` | Authenticated |

Full interactive docs at **http://localhost:8080/swagger-ui.html** when running locally.

---

## Collaborators

| Name | GitHub |
|---|---|
| Joseph Muchengeti | [@josephmuchie](https://github.com/josephmuchie) |

