const DEFAULT_PRODUCTION_API_ORIGIN = 'https://agritech-api.mst.co.zw';

/** Dev proxy path for OpenAPI JSON (see vite.config.ts — avoids clashing with SPA /api-docs) */
export const DEV_OPENAPI_PROXY_PATH = '/__backend/openapi';

/** REST base path including /api/v1 */
export function getApiBaseUrl(): string {
  // Dev: always use Vite proxy (/api → localhost:8081) for same-origin requests
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return `${DEFAULT_PRODUCTION_API_ORIGIN}/api/v1`;
}

/** API origin without /api/v1 — used for OpenAPI, WebSocket, and SSE */
export function getApiOrigin(): string {
  if (import.meta.env.DEV) {
    return '';
  }
  const base = getApiBaseUrl();
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return base.replace(/\/api\/v1\/?$/, '');
  }
  return DEFAULT_PRODUCTION_API_ORIGIN;
}

export function getOpenApiUrl(): string {
  if (import.meta.env.DEV) {
    return DEV_OPENAPI_PROXY_PATH;
  }
  if (import.meta.env.VITE_OPENAPI_URL) {
    return import.meta.env.VITE_OPENAPI_URL;
  }
  const origin = getApiOrigin();
  return origin ? `${origin}/api-docs` : '/api-docs';
}

export function getWebSocketUrl(): string {
  if (import.meta.env.DEV) {
    return '/ws';
  }
  const origin = getApiOrigin();
  if (origin) {
    return `${origin}/ws`;
  }
  return '/ws';
}
