import { fileURLToPath, URL } from 'node:url'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const modulesDir = fileURLToPath(new URL('./modules', import.meta.url))

const moduleServerDirs = readdirSync(modulesDir)
    .map(name => join(modulesDir, name, 'server'))
    .filter(p => { try { return statSync(p).isDirectory() } catch { return false } })

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  experimental: {
    emitRouteChunkError: 'automatic',
  },
  nitro: {
    scanDirs: moduleServerDirs,
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    adminSecretKey: process.env.ADMIN_SECRET_KEY,
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'es'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;700&display=swap' }
      ]
    }
  }
})
