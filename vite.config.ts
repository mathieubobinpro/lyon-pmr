import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      devOptions: { enabled: true },
      manifest: {
        name: 'Lyon PMR — Stationnement accessible',
        short_name: 'Lyon PMR',
        description: 'Trouvez rapidement une place de stationnement handicapée dans la Métropole de Lyon.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0066FF',
        background_color: '#0F0F12',
        lang: 'fr',
        categories: ['navigation', 'travel', 'accessibility'],
        icons: [
          { src: '/icons/icon-192.png',         sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-256.png',          sizes: '256x256', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384.png',          sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Place la plus proche',
            short_name: 'Plus proche',
            description: 'Trouver la place PMR la plus proche',
            url: '/#nearest',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
        ],
        screenshots: [
          { src: '/screenshots/mobile-map.png',  sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Écran carte PMR' },
          { src: '/screenshots/mobile-list.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Liste des places' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Tuiles CARTO — CacheFirst, 30 jours, max 100
            urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API Grand Lyon — StaleWhileRevalidate, 24h
            urlPattern: /^https:\/\/data\.grandlyon\.com\/geoserver\/wfs/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'grandlyon-api',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API Adresse BAN — NetworkFirst, timeout 3s
            urlPattern: /^https:\/\/api-adresse\.data\.gouv\.fr\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ban-api',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Sépare MapLibre dans son propre chunk — ne fait pas partie du bundle initial
        manualChunks: (id: string) => {
          if (id.includes('maplibre-gl')) return 'maplibre';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    // Exclure les tests Playwright (E2E) des tests Vitest (unit)
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/api/**'],
      // offlineCache.ts utilise IndexedDB (non testable en jsdom)
      exclude: ['src/lib/offlineCache.ts'],
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
});
