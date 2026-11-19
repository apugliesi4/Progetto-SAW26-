import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Usa il service worker custom (src/sw.js) per gestire sia la cache che le notifiche push
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      // Precacha icone e pagina di fallback offline dalla cartella public/
      includeAssets: ['offline.html', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Libreria-SAW - la tua magnifica raccolta di carta digitale',
        short_name: 'Libreria-SAW',
        description: 'Cerca libri e tieni traccia delle tue letture.',
        // Allineato alla variabile CSS --ink (#171224) per evitare flash di colore all'avvio
        theme_color: '#171224',
        background_color: '#171224',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      devOptions: {
        // Abilita il service worker anche in sviluppo per testare cache e notifiche
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