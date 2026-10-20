import { fileURLToPath, URL } from 'node:url'
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const modulesDir = fileURLToPath(new URL('./modules', import.meta.url))
const dynamicPageHeaders = {
  'cache-control': 'private, no-store, max-age=0',
  'cdn-cache-control': 'no-store',
  'vercel-cdn-cache-control': 'no-store'
}

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
  // Link inspection renders discovered pages during build. Public pages are
  // dynamic and may record views or refresh provider data, so production data
  // must never be crawled as a build side effect.
  linkChecker: {
    runOnBuild: false
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
    // Public pages are rendered dynamically. Keeping them out of ISR avoids
    // durable HTML/payload writes and makes confirmed mutations visible on the
    // next request without a fan-out of cache invalidation requests.
    '/': { headers: dynamicPageHeaders },
    '/stats': { headers: dynamicPageHeaders },
    '/saas': { headers: dynamicPageHeaders },
    '/saas/**': { headers: dynamicPageHeaders },
    '/saas/**/edit': {
      ssr: false,
      sitemap: false,
      headers: { ...dynamicPageHeaders, 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ranking': { headers: dynamicPageHeaders },
    '/en': { headers: dynamicPageHeaders },
    '/en/stats': { headers: dynamicPageHeaders },
    '/en/saas': { headers: dynamicPageHeaders },
    '/en/saas/**': { headers: dynamicPageHeaders },
    '/en/saas/**/edit': {
      ssr: false,
      sitemap: false,
      headers: { ...dynamicPageHeaders, 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/en/ranking': { headers: dynamicPageHeaders },
    '/dashboard/**': {
      ssr: false,
      sitemap: false,
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/admin/**': {
      sitemap: false,
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    }
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
      whopPlanId: process.env.WHOP_PLAN_ID,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      posthog: {
        publicKey: process.env.NUXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
        host: process.env.NUXT_PUBLIC_POSTHOG_HOST,
        posthogDefaults: '2026-01-30'
      }
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
