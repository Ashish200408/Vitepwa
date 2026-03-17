import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg'],
      
      manifest: {
        id: '/',                
        scope: '/',             
        name: 'Mood News App',
        short_name: 'MoodNews',
        description: 'Mood based news app with diverse news sources',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        
        screenshots: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.currentsapi\.services\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600
              }
            }
          },
          {
            urlPattern: /^https:\/\/via\.placeholder\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400
              }
            }
          }
        ]
      }
    })
  ]
})