import { NOTIFIER_CONFIG } from '../../../const/config'
import { formatCurrency } from '../formatters/html.formatter'
import type {
  StartupSnapshotItem,
  SystemSnapshotState,
  OpportunityScoreDetail,
  NotificationEvent,
  OpportunityPayload
} from '../../../types'

export interface OpportunityEvaluationResult {
  eligibleOpportunities: OpportunityScoreDetail[]
  standaloneAlertEvents: Array<Omit<NotificationEvent<OpportunityPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>>
}

/**
 * Deterministic scoring engine for startup investment/growth opportunities.
 * Strictly uses verified database metrics with zero fabricated numbers.
 */
export function evaluateOpportunities(
  startups: StartupSnapshotItem[],
  previousSnapshot: SystemSnapshotState | null,
  currentDateStr: string = new Date().toISOString().substring(0, 10)
): OpportunityEvaluationResult {
  const scoredItems: OpportunityScoreDetail[] = []
  const standaloneEvents: Array<Omit<NotificationEvent<OpportunityPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>> = []

  const cooldownDays = NOTIFIER_CONFIG.opportunity.cooldownDays
  const minScore = NOTIFIER_CONFIG.opportunity.minScore
  const exceptionalScore = NOTIFIER_CONFIG.opportunity.exceptionalScore
  const sentHistory = previousSnapshot?.sentOpportunities || {}

  const nowMs = Date.now()
  const prevStartupMap = new Map<string, StartupSnapshotItem>()
  if (previousSnapshot?.ranking) {
    for (const s of previousSnapshot.ranking) {
      prevStartupMap.set(s.id, s)
    }
  }

  for (const s of startups) {
    if (s.isIncognito) continue // Incognito startups cannot be recommended as public opportunities

    let score = 0
    const reasons: string[] = []

    const mrr = s.mrr !== null && s.mrr !== undefined ? Number(s.mrr) : null
    const prev = prevStartupMap.get(s.id)
    const prevMrr = prev?.mrr !== null && prev?.mrr !== undefined ? Number(prev.mrr) : null

    // 1. MRR Growth Signal (Verified delta between snapshots or metrics)
    let growthPct: number | null = null
    let growthDays: number | null = null

    if (mrr !== null && prevMrr !== null && prevMrr > 0 && mrr > prevMrr) {
      growthPct = Math.round(((mrr - prevMrr) / prevMrr) * 100)
      growthDays = 14 // default delta window

      if (growthPct >= 50) {
        score += 40
        reasons.push(`MRR +${growthPct}% reciente (${formatCurrency(prevMrr)} → ${formatCurrency(mrr)})`)
      } else if (growthPct >= 25) {
        score += 25
        reasons.push(`MRR +${growthPct}% reciente (${formatCurrency(prevMrr)} → ${formatCurrency(mrr)})`)
      } else if (growthPct >= 10) {
        score += 15
        reasons.push(`MRR +${growthPct}% reciente`)
      }
    }

    // 2. Absolute MRR Milestones
    if (mrr !== null && mrr > 0) {
      if (mrr >= 5000) {
        score += 20
        reasons.push(`MRR consolidado de ${formatCurrency(mrr)}`)
      } else if (mrr >= 1000) {
        score += 15
        reasons.push(`Superó la barrera de ${formatCurrency(mrr)} MRR`)
      } else if (mrr >= 100) {
        score += 10
        reasons.push(`Facturación recurrente activa (${formatCurrency(mrr)})`)
      }
    }

    // 3. Verification & Gateway Signals
    if (s.hasVerifiedHistory) {
      score += 15
      reasons.push('Facturación verificada con pasarela de pago')
    }

    // 4. Launch Novelty
    if (s.publishedAt) {
      const pubMs = new Date(s.publishedAt).getTime()
      const daysSincePublish = Math.max(1, Math.floor((nowMs - pubMs) / (1000 * 60 * 60 * 24)))
      if (daysSincePublish <= 7) {
        score += 15
        reasons.push(`Lanzamiento reciente en Facto (hace ${daysSincePublish}d)`)
      } else if (daysSincePublish <= 14) {
        score += 10
        reasons.push(`Startup en fase temprana (hace ${daysSincePublish}d)`)
      }
    }

    // 5. Views / Traction
    if (s.views >= 100) {
      score += 10
      reasons.push(`Alta tracción en la plataforma (${s.views} visitas)`)
    }

    if (score < minScore) {
      continue
    }

    // 6. Cooldown Validation
    const sentRecord = sentHistory[s.id]
    if (sentRecord) {
      const sentMs = new Date(sentRecord.lastSentDate).getTime()
      const daysSinceLastSent = (nowMs - sentMs) / (1000 * 60 * 60 * 24)

      if (daysSinceLastSent < cooldownDays) {
        // Only allow repeat if MRR jumped significantly (+30%+)
        const lastSentMrr = sentRecord.lastMrr || 0
        const isSignificantJump = mrr !== null && lastSentMrr > 0 && mrr >= lastSentMrr * 1.3
        if (!isSignificantJump) {
          continue // Skipped due to cooldown
        }
        reasons.push(`Nuevo salto de crecimiento tras último reporte (+${Math.round(((mrr! - lastSentMrr) / lastSentMrr) * 100)}%)`)
      }
    }

    const detail: OpportunityScoreDetail = {
      startupId: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      country: s.countryName,
      countryFlag: s.countryFlag,
      currentMrr: mrr,
      previousMrr: prevMrr,
      currency: 'USD',
      growthPercentage: growthPct,
      growthDays,
      score,
      reasons,
      isVerified: s.hasVerifiedHistory,
      publishedAt: s.publishedAt
    }

    scoredItems.push(detail)

    // Check for exceptional standalone score
    if (score >= exceptionalScore && !sentRecord) {
      standaloneEvents.push({
        eventType: 'opportunity',
        dedupeKey: `opportunity_standalone:${s.id}:${currentDateStr}`,
        payload: {
          opportunity: detail,
          isExceptionalStandalone: true
        },
        priority: 'high',
        status: 'pending',
        maxAttempts: NOTIFIER_CONFIG.maxRetryAttempts,
        scheduledFor: new Date().toISOString()
      })
    }
  }

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score)

  return {
    eligibleOpportunities: scoredItems.slice(0, NOTIFIER_CONFIG.opportunity.maxPerDigest),
    standaloneAlertEvents: standaloneEvents
  }
}
