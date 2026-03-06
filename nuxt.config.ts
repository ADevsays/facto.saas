import { fileURLToPath, URL } from 'node:url'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const modulesDir = fileURLToPath(new URL('./modules', import.meta.url))

const moduleServerDirs = readdirSync(modulesDir)
    .map(name => join(modulesDir, name, 'server'))
    .filter(p => { try { return statSync(p).isDirectory() } catch { return false } })

export default defineNuxtConfig({
  compatibilityDate: '2026-03-05',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@nuxtjs/seo'
  ],
  site: {
    url: 'https://factosaas.com',
    name: 'Facto | Valuación de SaaS',
    description: 'Calcula cuánto vale tu SaaS en segundos con datos reales del mercado.',
    defaultLocale: 'es',
  },
  robots: {
    disallow: ['/admin'],
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' }
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false
  },
  experimental: {
    emitRouteChunkError: 'automatic',
    payloadExtraction: false
  },
  nitro: {
    scanDirs: moduleServerDirs,
    prerender: {
      routes: ['/', '/en'],
      crawlLinks: true
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/en': { prerender: true },
    '/api/geoip': { swr: true },
    '/_nuxt/**': { cache: { maxAge: 60 * 60 * 24 * 365 } }
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    adminSecretKey: process.env.ADMIN_SECRET_KEY,
    public: {
      clarityProjectId: process.env.CLARITY_PROJECT_ID || ''
    }
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
