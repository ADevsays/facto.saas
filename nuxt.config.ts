import { fileURLToPath, URL } from 'node:url'
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
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
    '@nuxtjs/seo',
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    families: {
      'Playfair+Display': { wght: '400..900', ital: '400..900' },
      Inter: [300, 400, 700]
    },
    display: 'swap',
    preload: true,
    download: false
  },
  site: {
    url: 'https://www.factosaas.com',
    name: 'Facto',
    description: 'Calcula cuánto vale tu SaaS en segundos con datos reales del mercado.',
    titleSeparator: '|',
    trailingSlash: false,
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },
  robots: {
    disallow: ['/admin'],
  },
  i18n: {
    restructureDir: false as any,
    langDir: 'locales',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
      { code: 'es', name: 'Español', language: 'es-ES', file: 'es.json' }
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    baseUrl: 'https://www.factosaas.com'
  },
  features: {
    inlineStyles: true
  },
  experimental: {
    emitRouteChunkError: 'automatic',
    payloadExtraction: false,
  },
  nitro: {
    scanDirs: moduleServerDirs,
    compressPublicAssets: {
      brotli: true,
      gzip: true
    },
    prerender: {
      routes: [
        '/herramientas/cuanto-vale-tu-saas',
        '/en/tools/how-much-is-your-saas-worth'
      ],
      crawlLinks: false
    }
  },
  routeRules: {
    '/cuanto-vale-tu-saas': { redirect: { to: '/herramientas/cuanto-vale-tu-saas', statusCode: 301 } },
    '/_nuxt/**': { cache: { maxAge: 60 * 60 * 24 * 365 } },
    '/': { swr: 60 },
    '/stats': { swr: 60 },
    '/saas': { swr: 60 },
    '/saas/**': { swr: 60 },
    '/saas/**/edit': { ssr: false },
    '/ranking': { swr: 60 },
    '/en': { swr: 60 },
    '/en/stats': { swr: 60 },
    '/en/saas': { swr: 60 },
    '/en/saas/**': { swr: 60 },
    '/en/saas/**/edit': { ssr: false },
    '/en/ranking': { swr: 60 }
  },
  runtimeConfig: {
    encryptionKey: process.env.NUXT_ENCRYPTION_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    adminSecretKey: process.env.ADMIN_SECRET_KEY,
    mpClientId: process.env.MP_CLIENT_ID,
    mpClientSecret: process.env.MP_CLIENT_SECRET,
    mpRedirectUri: process.env.MP_REDIRECT_URI || 'http://localhost:3000/api/auth/mercadopago/callback',
    public: {
      clarityProjectId: process.env.CLARITY_PROJECT_ID || '',
      whopPlanId: process.env.WHOP_PLAN_ID,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
      ]
    }
  },
  hooks: {
    ready: (nuxt) => {
      const buildId = nuxt.options.runtimeConfig.app.buildId ||= nuxt.options.buildId || 'dev'
      const metaDir = join(nuxt.options.buildDir, 'manifest', 'meta')
      try {
        mkdirSync(metaDir, { recursive: true })
        const target = join(metaDir, `${buildId}.json`)
        if (!statSync(target, { throwIfNoEntry: false })) {
          writeFileSync(target, JSON.stringify({}))
        }
      } catch {}
    }
  },
  vite: {
    server: {
      allowedHosts: true
    }
  }
})
