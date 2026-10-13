import { supabase } from '~/server/lib/supabase'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] || character)
}

/**
 * Rendered as an ISR page only when explicitly enabled in a Preview
 * deployment. It reads exclusively from the isolated cache_e2e_test table.
 */
export default defineEventHandler(async (event) => {
  if (!useRuntimeConfig().cacheE2eEnabled) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const { data, error } = await supabase
    .from('cache_e2e_test')
    .select('value, revision, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Could not read the isolated cache test row' })
  }

  const value = data?.value || 'empty'
  setHeader(event, 'content-type', 'text/html; charset=utf-8')
  return `<!doctype html><html lang="en"><head><meta name="robots" content="noindex"><title>Cache E2E</title></head><body><main><h1>Cache E2E</h1><output id="cache-e2e-value">${escapeHtml(value)}</output></main></body></html>`
})
