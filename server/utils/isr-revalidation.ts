/**
 * The public pages are ISR assets on Vercel.  This module keeps the mapping
 * between a domain mutation and the assets which expose that data in one
 * place, so mutations do not fall back to a short, polling-style TTL.
 */
export type RevalidationKind = 'saas' | 'ads' | 'cache-e2e' | 'cache-e2e-saas'

export interface SaasCacheTarget {
  slug: string
  categorySlugs?: string[]
  countrySlug?: string | null
}

export interface RevalidationResult {
  requestedPaths: string[]
  failedPaths: string[]
  skipped: boolean
}

type RevalidationFetch = (input: string, init: RequestInit) => Promise<Response>

const SHARED_SAAS_PATHS = [
  '/',
  '/en',
  '/ranking',
  '/en/ranking',
  '/saas',
  '/en/saas',
  '/stats',
  '/en/stats',
  '/saas/categoria',
  '/saas/pais',
  '/saas/continente',
]

const ADS_PATHS = [
  '/',
  '/en',
  '/ranking',
  '/en/ranking',
  '/saas',
  '/en/saas',
  '/stats',
  '/en/stats',
]

function safeSegment(value: string | null | undefined): string | null {
  const segment = value?.trim().toLowerCase()
  return segment && /^[a-z0-9-]+$/.test(segment) ? segment : null
}

function unique(paths: string[]): string[] {
  return [...new Set(paths)]
}

/** Normalizes Supabase's object-or-array relation shape without trusting it. */
export function relationSlug(relation: unknown): string | null {
  const record = Array.isArray(relation) ? relation[0] : relation
  if (!record || typeof record !== 'object') return null
  const slug = (record as { slug?: unknown }).slug
  return typeof slug === 'string' ? slug : null
}

/** Routes whose rendered content changes after publishing or editing a SaaS. */
export function saasRevalidationPaths(target: SaasCacheTarget): string[] {
  const slug = safeSegment(target.slug)
  const paths = [...SHARED_SAAS_PATHS]

  if (slug) {
    paths.push(`/saas/${slug}`, `/en/saas/${slug}`)
  }

  for (const category of target.categorySlugs || []) {
    const segment = safeSegment(category)
    if (segment) paths.push(`/saas/categoria/${segment}`, `/en/saas/categoria/${segment}`)
  }

  const country = safeSegment(target.countrySlug)
  if (country) paths.push(`/saas/pais/${country}`, `/en/saas/pais/${country}`)

  return unique(paths)
}

/**
 * Ads are part of the global layout. Revalidating the shared public entry
 * pages updates their SSR payload; the current tab is refreshed through the
 * existing BroadcastChannel after an ad mutation.
 */
export function adsRevalidationPaths(): string[] {
  return [...ADS_PATHS]
}

/** Preview-only probe used to verify Vercel ISR without application records. */
export function cacheE2eRevalidationPaths(): string[] {
  // The Preview fixture is rendered by the real global marquee. Revalidating
  // its probe routes alone proves nothing about the public Home document.
  return unique([...adsRevalidationPaths(), '/__cache-e2e', '/__cache-e2e/ads'])
}

export function cacheE2eSaasRevalidationPaths(slug: string): string[] {
  const safeSlug = safeSegment(slug)
  return unique(['/', '/saas', '/ranking', ...(safeSlug ? [`/saas/${safeSlug}`] : [])])
}

/**
 * Sends the Vercel ISR invalidation header only from the server.  A failed
 * cache purge is deliberately reported, but never turns a committed database
 * mutation into a client-visible failure.
 */
export async function requestISRRevalidation(
  origin: string,
  bypassToken: string | undefined,
  paths: string[],
  fetcher: RevalidationFetch = fetch,
): Promise<RevalidationResult> {
  const requestedPaths = unique(paths)
  if (!bypassToken) {
    return { requestedPaths, failedPaths: [], skipped: true }
  }

  const base = origin.replace(/\/$/, '')
  const attempts = await Promise.allSettled(requestedPaths.map(async (path) => {
    const response = await fetcher(`${base}${path}`, {
      method: 'GET',
      headers: { 'x-prerender-revalidate': bypassToken },
    })
    if (!response.ok) throw new Error(`${path}: ${response.status}`)
  }))

  return {
    requestedPaths,
    failedPaths: requestedPaths.filter((_, index) => attempts[index].status === 'rejected'),
    skipped: false,
  }
}

export async function revalidatePublicPaths(event: any, kind: RevalidationKind, target?: SaasCacheTarget): Promise<RevalidationResult> {
  const paths = kind === 'ads'
    ? adsRevalidationPaths()
    : kind === 'cache-e2e'
      ? cacheE2eRevalidationPaths()
      : kind === 'cache-e2e-saas'
        ? cacheE2eSaasRevalidationPaths(target?.slug || '')
      : saasRevalidationPaths(target || { slug: '' })
  return revalidateISRPaths(event, kind, paths)
}

/** Revalidates an already-whitelisted route set in a single event. */
export async function revalidateISRPaths(event: any, kind: RevalidationKind, paths: string[]): Promise<RevalidationResult> {
  const config = useRuntimeConfig()
  // Never derive the destination from Host/X-Forwarded-Host: a public request
  // could otherwise make the server disclose its bypass token to that host.
  const origin = config.isrRevalidationOrigin || (import.meta.dev ? getRequestURL(event).origin : '')
  if (!origin) {
    const result = { requestedPaths: unique(paths), failedPaths: [], skipped: true }
    console.error('[ISR] Revalidation skipped: ISR_REVALIDATION_ORIGIN is missing')
    return result
  }
  const result = await requestISRRevalidation(
    origin,
    config.isrBypassToken,
    paths,
  )

  if (result.skipped || result.failedPaths.length) {
    console.error('[ISR] Revalidation incomplete', {
      kind,
      skipped: result.skipped,
      failedPaths: result.failedPaths,
    })
  }

  return result
}
