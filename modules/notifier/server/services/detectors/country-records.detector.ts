import { NOTIFIER_CONFIG } from '../../../const/config'
import { formatCurrency, formatInteger } from '../formatters/html.formatter'
import type {
  SystemSnapshotState,
  NotificationEvent,
  CountryRecordPayload
} from '../../../types'

export interface CountryAggregates {
  slug: string
  name: string
  flag: string
  totalRevenue: number
  startupsCount: number
}

/**
 * Pure detector that identifies when a country beats its all-time record by the minimum margin.
 */
export function detectCountryRecords(
  currentCountries: CountryAggregates[],
  previousSnapshot: SystemSnapshotState | null
): Array<Omit<NotificationEvent<CountryRecordPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>> {
  if (!previousSnapshot) {
    return [] // Baseline: no events emitted
  }

  const events: Array<Omit<NotificationEvent<CountryRecordPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>> = []
  const margin = NOTIFIER_CONFIG.countryRecordMarginPercent
  const minRevenue = NOTIFIER_CONFIG.minCountryRevenueForRecord

  for (const country of currentCountries) {
    if (!country.slug || country.slug === 'global') continue

    const prevCountry = previousSnapshot.countries[country.slug]
    const prevMaxRev = prevCountry?.maxRevenueRecord || prevCountry?.totalRevenue || 0
    const prevMaxStartups = prevCountry?.maxStartupsRecord || prevCountry?.startupsCount || 0

    // 1. Check Revenue Record
    if (country.totalRevenue >= minRevenue && country.totalRevenue > prevMaxRev) {
      const diff = country.totalRevenue - prevMaxRev
      const percentageGrowth = prevMaxRev > 0 ? (diff / prevMaxRev) * 100 : 100

      // Only trigger if growth exceeds margin threshold
      if (prevMaxRev === 0 || (country.totalRevenue >= prevMaxRev * (1 + margin))) {
        events.push({
          eventType: 'country_record',
          dedupeKey: `country_record:${country.slug}:revenue:${Math.round(country.totalRevenue)}`,
          payload: {
            countryName: country.name,
            countrySlug: country.slug,
            countryFlag: country.flag,
            metric: 'revenue',
            previousValue: prevMaxRev,
            newValue: country.totalRevenue,
            formattedValue: formatCurrency(country.totalRevenue),
            growthPercentage: percentageGrowth
          },
          priority: 'high',
          status: 'pending',
          maxAttempts: NOTIFIER_CONFIG.maxRetryAttempts,
          scheduledFor: new Date().toISOString()
        })
      }
    }

    // 2. Check Startups Count Record (at least +2 startups if baseline existed, or +5% growth)
    if (country.startupsCount > prevMaxStartups && country.startupsCount >= 3) {
      const countDiff = country.startupsCount - prevMaxStartups
      if (prevMaxStartups === 0 || countDiff >= 2 || country.startupsCount >= Math.ceil(prevMaxStartups * (1 + margin))) {
        const pct = prevMaxStartups > 0 ? (countDiff / prevMaxStartups) * 100 : 100
        events.push({
          eventType: 'country_record',
          dedupeKey: `country_record:${country.slug}:startups:${country.startupsCount}`,
          payload: {
            countryName: country.name,
            countrySlug: country.slug,
            countryFlag: country.flag,
            metric: 'startups',
            previousValue: prevMaxStartups,
            newValue: country.startupsCount,
            formattedValue: `${formatInteger(country.startupsCount)} startups`,
            growthPercentage: pct
          },
          priority: 'high',
          status: 'pending',
          maxAttempts: NOTIFIER_CONFIG.maxRetryAttempts,
          scheduledFor: new Date().toISOString()
        })
      }
    }
  }

  return events
}
