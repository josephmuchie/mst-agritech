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

/** Host shown in API docs hero (no protocol). */
export function getDisplayApiHost(): string {
  if (import.meta.env.DEV) {
    return 'localhost:8081';
  }
  const origin = getApiOrigin();
  return origin.replace(/^https?:\/\//, '') || 'agritech-api.mst.co.zw';
}

/** Absolute server URL used in OpenAPI spec / Swagger try-it-out. */
export function getOpenApiServerUrl(): string {
  if (import.meta.env.DEV) {
    return 'http://localhost:8081';
  }
  return getApiOrigin() || DEFAULT_PRODUCTION_API_ORIGIN;
}

/** Normalize fetched OpenAPI spec — fix server list and inject schema examples. */
export function patchOpenApiSpec(spec: Record<string, unknown>): Record<string, unknown> {
  const serverUrl = getOpenApiServerUrl();
  const servers: Array<{ url: string; description: string }> = [
    { url: serverUrl, description: 'MST Agritech API' },
  ];
  if (import.meta.env.DEV) {
    servers.push({ url: 'http://localhost:8081', description: 'Local development' });
  }

  const patched = { ...spec, servers };
  return enrichSchemaExamples(patched);
}

type OpenApiSchema = {
  properties?: Record<string, { example?: unknown; type?: string; $ref?: string }>;
  example?: unknown;
  items?: OpenApiSchema;
};

function enrichSchemaExamples(spec: Record<string, unknown>): Record<string, unknown> {
  const components = spec.components as { schemas?: Record<string, OpenApiSchema> } | undefined;
  if (!components?.schemas) return spec;

  const schemas = { ...components.schemas };
  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.example != null) continue;
    const built = buildExampleFromSchema(schema);
    if (built != null) {
      schemas[name] = { ...schema, example: built };
    }
  }

  return { ...spec, components: { ...components, schemas } };
}

function buildExampleFromSchema(schema: OpenApiSchema): unknown {
  if (!schema.properties) return null;
  const example: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.example !== undefined) {
      example[key] = prop.example;
    } else if (prop.type === 'array') {
      example[key] = [];
    } else if (prop.type === 'integer') {
      example[key] = 1;
    } else if (prop.type === 'number') {
      example[key] = 0;
    } else if (prop.type === 'boolean') {
      example[key] = false;
    } else {
      example[key] = '';
    }
  }
  return Object.keys(example).length > 0 ? example : null;
}
