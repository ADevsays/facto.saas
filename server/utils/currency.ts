import { $fetch } from 'ofetch'
import { supabase } from '~/server/lib/supabase'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetches exchange rates from a free API (USD base)
 * and caches them for 24 hours persistently using Supabase.
 * This guarantees it works on Vercel across cold starts.
 */
async function getRates(): Promise<Record<string, number>> {
  const now = Date.now()

  try {
    // 1. Check Supabase (Persistent across Vercel cold starts)
    const { data: dbCache } = await supabase
      .from('global_exchange_rates')
      .select('rates, updated_at')
      .eq('id', 1)
      .single()

    if (dbCache && dbCache.rates) {
      const updated = new Date(dbCache.updated_at).getTime()
      if (now - updated < CACHE_TTL_MS) {
        return dbCache.rates
      }
    }

    // 2. Cache expired or missing, fetch from API
    const data = await $fetch<any>('https://open.er-api.com/v6/latest/USD')
    if (data && data.rates) {
      // Save to Supabase
      await supabase
        .from('global_exchange_rates')
        .upsert({ id: 1, rates: data.rates, updated_at: new Date().toISOString() })

      return data.rates
    }
  } catch (err) {
    console.error('[currency] Failed to fetch exchange rates:', err)
  }

  return {}
}

/**
 * Converts any amount from a given currency to USD.
 * Currency codes are case-insensitive.
 * If currency is not found or is USD, returns the original amount.
 */
export async function convertToUsd(amount: number, currency: string): Promise<number> {
  const code = (currency || 'USD').toUpperCase()
  if (code === 'USD') return amount

  const rates = await getRates()
  const rate = rates[code]

  // If rate exists (e.g. MXN rate is 20, 1 USD = 20 MXN), divide amount by rate to get USD
  if (rate && rate > 0) {
    return amount / rate
  }

  // Fallback to raw amount if currency code not found
  return amount
}
