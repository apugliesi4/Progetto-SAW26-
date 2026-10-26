import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // injectManifest: usiamo un service worker scritto a mano (src/sw.js) invece di quello generato automaticamente, perché deve anche gestire
      // le notifiche push di Firebase Cloud Messaging in background.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        swSrc: 'src/sw.js',
        swDest: 'dist/sw.js',
      },
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Libreria-SAW - la tua libreria personale',
        short_name: 'Libreria-SAW',
        description: 'Cerca libri e tieni traccia delle tue letture.',
        theme_color: '#12241f',
        background_color: '#12241f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      devOptions: {
        // attiva il service worker anche in `npm run dev`, non solo in build di produzione — necessario per testare le notifiche push subito.
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
})