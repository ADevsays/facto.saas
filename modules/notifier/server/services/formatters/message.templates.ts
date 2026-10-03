import {
  escapeHtml,
  formatCurrency,
  formatCurrencyDelta,
  formatPercentage,
  formatInteger,
  formatDateSpanish,
  buildUtmLink,
  buildUtmUrl
} from './html.formatter'
import { NOTIFIER_CONFIG } from '../../../const/config'
import type {
  NewStartupPayload,
  CountryRecordPayload,
  RankingMovePayload,
  VisitsRecordPayload,
  DailyDigestPayload,
  OpportunityPayload,
  OpportunityScoreDetail
} from '../../../types'

export interface RenderResult {
  text: string
  valid: boolean
  skipReason?: string
}

/**
 * Template for New Startup(s) event.
 */
export function renderNewStartupMessage(payload: NewStartupPayload): RenderResult {
  if (!payload?.startups || payload.startups.length === 0) {
    return { text: '', valid: false, skipReason: 'No startups provided in payload' }
  }

  const validStartups = payload.startups.filter(s => s.name && s.name.trim().length > 0)
  if (validStartups.length === 0) {
    return { text: '', valid: false, skipReason: 'All startups lack a valid name' }
  }

  if (validStartups.length === 1) {
    const s = validStartups[0]
    const name = escapeHtml(s.name)
    const category = escapeHtml(s.category || 'Software')
    const country = s.country ? `${s.countryFlag ? `${s.countryFlag} ` : ''}${escapeHtml(s.country)}` : null

    // Description snippet formatted with ellipsis
    let descLine = ''
    if (s.description && s.description.trim()) {
      const cleanDesc = s.description.trim().replace(/\s+/g, ' ')
      const truncated = cleanDesc.length > 120 ? `${cleanDesc.substring(0, 117)}...` : (cleanDesc.endsWith('...') ? cleanDesc : `${cleanDesc.replace(/\.+$/, '')}...`)
      descLine = `\n\n<i>"${escapeHtml(truncated)}"</i>`
    }

    const metaParts = [country, `Categoría: ${category}`].filter(Boolean).join(' • ')
    const metaLine = metaParts ? `\n\n📍 ${metaParts}` : ''

    let mrrLine = ''
    if (s.isIncognito) {
      mrrLine = '\n🔒 MRR en modo privado'
    } else if (s.mrr !== null && s.mrr !== undefined && !Number.isNaN(s.mrr)) {
      mrrLine = `\n💵 MRR verificado: <b>${formatCurrency(s.mrr)} / mes</b>`
    }

    let rankLine = ''
    if (s.rank) {
      if (s.rank === 1) {
        rankLine = '\n🥇 <b>#1 en el ranking global de Facto</b>'
      } else if (s.rank <= 3) {
        rankLine = `\n🏆 <b>#${s.rank} en el ranking global</b> (¡Top 3!)`
      } else if (s.rank <= 10) {
        rankLine = `\n🔥 <b>#${s.rank} en el ranking global</b> (¡Top 10!)`
      } else {
        rankLine = `\n📊 Posición en el ranking: <b>#${s.rank}</b>${s.totalRanked ? ` de ${s.totalRanked}` : ''}`
      }
    }

    const saasUrl = s.isIncognito
      ? buildUtmUrl('/ranking', 'new_startup')
      : buildUtmUrl(`/saas/${s.slug}`, 'new_startup')
    const ctaLink = s.isIncognito
      ? `<a href="${saasUrl}">Explora el ranking en vivo →</a>`
      : `<a href="${saasUrl}">Conoce todas sus métricas y evolución aquí →</a>`

    const titlePrefix = s.isIncognito
      ? '¡Nueva startup en Facto! Un nuevo proyecto acaba de sumarse a la plataforma en modo privado.'
      : `¡Nueva startup en Facto! <b>${name}</b> acaba de sumarse a la plataforma.`

    const text = `${titlePrefix}${descLine}${metaLine}${mrrLine}${rankLine}\n\n👉 ${ctaLink}`

    return { text, valid: true }
  }

  // Batch mode
  const header = `¡Nuevas startups en Facto! Se acaban de sumar <b>${validStartups.length} proyectos</b> al ranking:`

  const items = validStartups.map(s => {
    const name = escapeHtml(s.name)
    const category = escapeHtml(s.category || 'Software')
    const country = s.country ? `${s.countryFlag ? `${s.countryFlag} ` : ''}${escapeHtml(s.country)}` : null
    const metaParts = [category, country].filter(Boolean).join(', ')

    let mrrStr = ''
    if (s.isIncognito) {
      mrrStr = ' • MRR privado'
    } else if (s.mrr !== null && s.mrr !== undefined && !Number.isNaN(s.mrr)) {
      mrrStr = ` • MRR: ${formatCurrency(s.mrr)}`
    }

    const rankStr = s.rank ? ` • #${s.rank}` : ''

    let snippet = ''
    if (s.description && s.description.trim()) {
      const clean = s.description.trim().replace(/\s+/g, ' ')
      const truncated = clean.length > 60 ? `${clean.substring(0, 57)}...` : clean
      snippet = ` — <i>"${escapeHtml(truncated)}"</i>`
    }

    const link = buildUtmLink(`/saas/${s.slug}`, 'new_startup', name)
    return `• ${link} (${metaParts}${mrrStr}${rankStr})${snippet}`
  })

  const rankingUrl = buildUtmUrl('/ranking', 'new_startup')
  const rankingCta = `<a href="${rankingUrl}">Explora las métricas y el ranking completo →</a>`
  const text = `${header}\n\n${items.join('\n')}\n\n👉 ${rankingCta}`

  return { text, valid: true }
}

/**
 * Template for Country Record event.
 */
export function renderCountryRecordMessage(payload: CountryRecordPayload): RenderResult {
  if (!payload?.countryName || !payload.newValue) {
    return { text: '', valid: false, skipReason: 'Country record missing name or value' }
  }

  const flag = payload.countryFlag ? `${payload.countryFlag} ` : ''
  const country = escapeHtml(payload.countryName)
  const metricName = payload.metric === 'revenue' ? 'facturación histórica' : 'startups registradas'
  const valueFormatted = payload.metric === 'revenue'
    ? formatCurrency(payload.newValue)
    : `${formatInteger(payload.newValue)} startups`

  const growth = payload.growthPercentage > 0
    ? ` (+${Math.round(payload.growthPercentage)}%)`
    : ''

  const header = `🏆 <b>Nuevo récord en ${flag}${country}</b>`
  const body = `Alcanza un nuevo máximo de ${metricName}: <b>${valueFormatted}</b>${growth}.`
  const cta = buildUtmLink(`/paises/${payload.countrySlug}`, 'country_record', `Ver ranking de ${country}`)

  const text = `${header}\n\n${body}\n\n👉 ${cta}`
  return { text, valid: true }
}

/**
 * Template for Ranking Move(s) event.
 */
export function renderRankingMoveMessage(payload: RankingMovePayload): RenderResult {
  if (!payload?.moves || payload.moves.length === 0) {
    return { text: '', valid: false, skipReason: 'No ranking moves provided' }
  }

  const validMoves = payload.moves.filter(m => m.name && m.newRank > 0)
  if (validMoves.length === 0) {
    return { text: '', valid: false, skipReason: 'No valid moves in ranking payload' }
  }

  const header = `📈 <b>Movimientos destacados en el ranking</b>`
  const items = validMoves.map(m => {
    const name = escapeHtml(m.name)
    const flag = m.countryFlag ? `${m.countryFlag} ` : ''
    const link = buildUtmLink(`/saas/${m.slug}`, 'ranking_move', name)

    if (m.overtookName) {
      return `• ${flag}${link} adelanta a ${escapeHtml(m.overtookName)} y sube al <b>#${m.newRank}</b>`
    }
    const diff = m.previousRank > 0 ? ` (+${m.previousRank - m.newRank} puestos)` : ''
    return `• ${flag}${link} sube al <b>#${m.newRank}</b>${diff}`
  })

  const cta = buildUtmLink('/ranking', 'ranking_move', 'Ver ranking completo')
  const text = `${header}\n\n${items.join('\n')}\n\n👉 ${cta}`
  return { text, valid: true }
}

/**
 * Template for Visits Record event.
 */
export function renderVisitsRecordMessage(payload: VisitsRecordPayload): RenderResult {
  if (!payload?.totalVisits || payload.totalVisits <= 0) {
    return { text: '', valid: false, skipReason: 'Invalid visits count' }
  }

  const formattedVisits = formatInteger(payload.totalVisits)
  const growth = payload.growthPercentage > 0 ? ` (+${Math.round(payload.growthPercentage)}%)` : ''

  const header = `🔥 <b>Récord de visitas diarias en Facto</b>`
  const body = `La plataforma alcanzó un nuevo máximo histórico de <b>${formattedVisits}</b> visitas en un día${growth}.`
  const cta = buildUtmLink('/ranking', 'visits_record', 'Explorar startups')

  const text = `${header}\n\n${body}\n\n👉 ${cta}`
  return { text, valid: true }
}

/**
 * Template for Standalone Exceptional Opportunity.
 */
export function renderOpportunityMessage(payload: OpportunityPayload): RenderResult {
  const opp = payload?.opportunity
  if (!opp?.name || !opp.slug) {
    return { text: '', valid: false, skipReason: 'Opportunity payload missing startup name/slug' }
  }

  const name = escapeHtml(opp.name)
  const category = escapeHtml(opp.category || 'Software')
  const country = opp.country ? `${opp.countryFlag ? `${opp.countryFlag} ` : ''}${escapeHtml(opp.country)}` : ''
  const meta = [category, country].filter(Boolean).join(', ')

  const link = buildUtmLink(`/saas/${opp.slug}`, 'opportunity', name)
  const header = `💡 <b>Oportunidad destacada: ${name}</b>`
  const metaLine = meta ? `(${meta})` : ''

  const reasonsText = opp.reasons && opp.reasons.length > 0
    ? opp.reasons.map(r => `• ${escapeHtml(r)}`).join('\n')
    : `• Crecimiento destacado en la plataforma`

  let mrrInfo = ''
  if (opp.currentMrr !== null && opp.currentMrr !== undefined) {
    mrrInfo = `\nMRR actual: <b>${formatCurrency(opp.currentMrr)}</b>`
  }

  const disclaimer = `<i>${escapeHtml(NOTIFIER_CONFIG.financialDisclaimer)}</i>`
  const cta = buildUtmLink(`/saas/${opp.slug}`, 'opportunity', 'Ver perfil de la startup')

  const text = `${header} ${metaLine}\n${mrrInfo}\n\n<b>Por qué destaca:</b>\n${reasonsText}\n\n👉 ${cta}\n\n${disclaimer}`
  return { text, valid: true }
}

/**
 * Template for Daily Digest.
 */
export function renderDailyDigestMessage(payload: DailyDigestPayload): RenderResult {
  if (!payload) {
    return { text: '', valid: false, skipReason: 'Digest payload is missing' }
  }

  const header = `🗓 <b>Resumen de Facto — ${escapeHtml(payload.dateStr)}</b>`

  if (payload.isQuietDay) {
    const quietBody = `Hoy ha sido un día tranquilo en el ecosistema. Todas las métricas se mantienen estables.`
    const totalRev = payload.globalRevenue > 0
      ? `\n• Facturación global activa: <b>${payload.globalRevenueFormatted}</b>`
      : ''
    const statsUrl = buildUtmUrl('/stats', 'daily_digest')
    const cta = `<a href="${statsUrl}">Ver estadísticas actualizadas →</a>`
    const text = `${header}\n\n${quietBody}${totalRev}\n\n👉 ${cta}`
    return { text, valid: true }
  }

  const sections: string[] = []

  // 1. New startups section
  if (payload.newStartupsCount > 0) {
    const countryCounts: Record<string, number> = {}
    for (const s of payload.newStartupsSummary) {
      const c = s.country || 'Global'
      countryCounts[c] = (countryCounts[c] || 0) + 1
    }
    const countryBreakdown = Object.entries(countryCounts)
      .map(([c, count]) => `${count} ${escapeHtml(c)}`)
      .join(', ')

    const suffix = countryBreakdown ? ` (${countryBreakdown})` : ''
    sections.push(`• <b>${payload.newStartupsCount}</b> ${payload.newStartupsCount === 1 ? 'startup nueva' : 'startups nuevas'}${suffix}`)
  }

  // 2. Global revenue & delta
  if (payload.globalRevenue > 0) {
    const deltaStr = payload.globalRevenueChange !== 0
      ? ` (${formatCurrencyDelta(payload.globalRevenueChange)})`
      : ''
    sections.push(`• Total facturado global: <b>${payload.globalRevenueFormatted}</b>${deltaStr}`)
  }

  // 3. Country top movers
  if (payload.topCountryMovers && payload.topCountryMovers.length > 0) {
    const moverText = payload.topCountryMovers.slice(0, 2).map(m => {
      const flag = m.countryFlag ? `${m.countryFlag} ` : ''
      return `${flag}${escapeHtml(m.country)} (${m.revenueChangeFormatted})`
    }).join(', ')
    sections.push(`• Países en alza: ${moverText}`)
  }

  // 4. Visits vs 7-day average
  if (payload.visitsSummary && payload.visitsSummary.todayVisits > 0) {
    const change = formatPercentage(payload.visitsSummary.changePercentage)
    const visitsFormatted = formatInteger(payload.visitsSummary.todayVisits)
    sections.push(`• Visitas: <b>${visitsFormatted}</b> (${change} vs. prom. 7 días)`)
  }

  // 5. Opportunities section
  let oppsBlock = ''
  if (payload.opportunities && payload.opportunities.length > 0) {
    const oppItems = payload.opportunities.slice(0, NOTIFIER_CONFIG.opportunity.maxPerDigest).map((opp, idx) => {
      const name = escapeHtml(opp.name)
      const category = escapeHtml(opp.category || 'Software')
      const country = opp.country ? `${opp.countryFlag ? `${opp.countryFlag} ` : ''}${escapeHtml(opp.country)}` : ''
      const meta = [category, country].filter(Boolean).join(', ')
      const primaryReason = opp.reasons?.[0] ? escapeHtml(opp.reasons[0]) : 'Crecimiento destacado'
      const link = buildUtmLink(`/saas/${opp.slug}`, 'daily_digest', name)

      return `${idx + 1}. ${link} (${meta}): ${primaryReason}`
    })

    oppsBlock = `\n\n💡 <b>Oportunidades del día</b>\n${oppItems.join('\n')}\n<i>${escapeHtml(NOTIFIER_CONFIG.financialDisclaimer)}</i>`
  }

  const statsUrl = buildUtmUrl('/stats', 'daily_digest')
  const cta = `<a href="${statsUrl}">Ver todas las estadísticas y métricas del ecosistema →</a>`
  const text = `${header}\n\n${sections.join('\n')}${oppsBlock}\n\n👉 ${cta}`

  return { text, valid: true }
}
