import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Dev-only path for OpenAPI JSON — must not collide with SPA route /api-docs */
const DEV_OPENAPI_PROXY = '/__backend/openapi'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      // Do NOT proxy /api — it matches the SPA route /api-docs and breaks client routing
      [DEV_OPENAPI_PROXY]: {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: () => '/api-docs',
      },
      '/api/v1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/swagger-ui': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})

export { DEV_OPENAPI_PROXY }
