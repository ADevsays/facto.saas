import { NOTIFIER_CONFIG } from '../../../const/config'

/**
 * Escapes HTML characters (&, <, >) to ensure valid parse_mode=HTML in Telegram.
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Formats numbers into human-readable compact currency strings (e.g. $1K, $12.4K, $1.2M).
 */
export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—'
  if (val === 0) return '$0'
  const abs = Math.abs(val)
  const sign = val < 0 ? '-' : ''

  if (abs >= 1_000_000) {
    const formatted = (abs / 1_000_000).toFixed(1).replace('.0', '')
    return `${sign}$${formatted}M`
  }
  if (abs >= 1_000) {
    const formatted = (abs / 1_000).toFixed(1).replace('.0', '')
    return `${sign}$${formatted}K`
  }
  return `${sign}$${Math.round(abs)}`
}

/**
 * Formats delta changes with +/- prefix (e.g. +$2.1K, -$500).
 */
export function formatCurrencyDelta(val: number): string {
  if (val === 0) return '$0'
  const prefix = val > 0 ? '+' : ''
  return `${prefix}${formatCurrency(val)}`
}

/**
 * Formats signed percentages (e.g. +18%, -5%).
 */
export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—'
  const sign = val > 0 ? '+' : ''
  return `${sign}${Math.round(val)}%`
}

/**
 * Formats numbers with thousand separators (e.g. 1.240).
 */
export function formatInteger(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '0'
  return new Intl.NumberFormat('es-CO').format(Math.round(val))
}

/**
 * Formats date into Spanish short month (e.g. "28 sep").
 */
export function formatDateSpanish(dateInput: Date | string, timezone = NOTIFIER_CONFIG.defaultTimezone): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    timeZone: timezone
  }).format(d).replace('.', '')
}

export function buildUtmUrl(path: string, campaign: string): string {
  let baseUrl = (NOTIFIER_CONFIG.baseSiteUrl || 'https://www.factosaas.com').trim().replace(/\/$/, '')
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = baseUrl.includes('localhost') ? `http://${baseUrl}` : `https://${baseUrl}`
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const separator = cleanPath.includes('?') ? '&' : '?'
  return `${baseUrl}${cleanPath}${separator}utm_source=${NOTIFIER_CONFIG.utmSource}&utm_medium=${NOTIFIER_CONFIG.utmMedium}&utm_campaign=${campaign}`
}

export function buildUtmLink(path: string, campaign: string, label: string): string {
  const fullUrl = buildUtmUrl(path, campaign)
  return `<a href="${fullUrl}">${escapeHtml(label)}</a>`
}

/**
 * Splits a long HTML message into valid chunks <= maxLength (4096)
 * splitting along section/line boundaries without breaking tags.
 */
export function splitMessageIntoChunks(text: string, maxLength: number = NOTIFIER_CONFIG.maxMessageLength): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  const paragraphs = text.split('\n\n')
  let currentChunk = ''

  for (const para of paragraphs) {
    const candidate = currentChunk ? `${currentChunk}\n\n${para}` : para
    if (candidate.length <= maxLength) {
      currentChunk = candidate
    } else {
      if (currentChunk) {
        chunks.push(currentChunk)
        currentChunk = ''
      }
      if (para.length <= maxLength) {
        currentChunk = para
      } else {
        // Line-by-line fallback if a single paragraph is too large
        const lines = para.split('\n')
        for (const line of lines) {
          const lineCandidate = currentChunk ? `${currentChunk}\n${line}` : line
          if (lineCandidate.length <= maxLength) {
            currentChunk = lineCandidate
          } else {
            if (currentChunk) chunks.push(currentChunk)
            currentChunk = line
          }
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks.length ? chunks : [text]
}
