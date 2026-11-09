import https from 'node:https'
import type { PaymentProviderService, ProviderValidationResult } from '~/modules/add-saas/types'
import { convertToUsd } from '~/server/utils/currency'

const API_BASE = 'https://apify.epayco.co'
const MAX_TRANSACTIONS = 20_000
const PAGE_SIZE = 100

interface EpaycoCredentials {
  publicKey: string
  privateKey: string
}

interface EpaycoTransaction {
  referencePayco?: string | number
  referenceClient?: string
  transactionDate?: string
  amount?: string | number
  currency?: string
  status?: string
}

function parseCredentials(value: string): EpaycoCredentials {
  const credentials = JSON.parse(value) as Partial<EpaycoCredentials>
  if (typeof credentials.publicKey !== 'string' || !credentials.publicKey.trim()) {
    throw new Error('ePayco PUBLIC_KEY is required')
  }
  if (typeof credentials.privateKey !== 'string' || !credentials.privateKey.trim()) {
    throw new Error('ePayco PRIVATE_KEY is required')
  }
  return { publicKey: credentials.publicKey.trim(), privateKey: credentials.privateKey.trim() }
}

async function getToken(credentials: EpaycoCredentials): Promise<string> {
  const basic = Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')
  const response = await $fetch<{ token?: string }>(`${API_BASE}/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
    timeout: 20_000,
  })
  if (!response?.token) throw new Error('ePayco did not return an API token')
  return response.token
}

// ePayco documents GET /transaction with a JSON request body. Node's fetch
// rejects bodies on GET, so use https.request for this documented endpoint.
function getTransactionsPage(token: string, page: number): Promise<any> {
  const payload = Buffer.from(JSON.stringify({
    filter: {},
    pagination: { page, limit: PAGE_SIZE },
  }))

  return new Promise((resolve, reject) => {
    const request = https.request(`${API_BASE}/transaction`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': payload.byteLength,
        Accept: 'application/json',
      },
      timeout: 20_000,
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', chunk => chunks.push(Buffer.from(chunk)))
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        if ((response.statusCode || 500) >= 400) {
          const error = new Error(`ePayco transaction query failed with HTTP ${response.statusCode}`) as Error & { statusCode?: number }
          error.statusCode = response.statusCode
          reject(error)
          return
        }
        try { resolve(JSON.parse(raw)) } catch { reject(new Error('ePayco returned invalid transaction JSON')) }
      })
    })

    request.on('timeout', () => request.destroy(new Error('ePayco transaction query timed out')))
    request.on('error', reject)
    request.end(payload)
  })
}

function toTimestamp(value: unknown): number {
  const parsed = Date.parse(String(value || ''))
  if (!Number.isFinite(parsed)) throw new Error('ePayco transaction is missing a valid date')
  return Math.floor(parsed / 1000)
}

async function fetchTransactions(token: string): Promise<EpaycoTransaction[]> {
  const all = new Map<string, EpaycoTransaction>()
  let expectedTotal: number | null = null
  for (let page = 1; page <= Math.ceil(MAX_TRANSACTIONS / PAGE_SIZE); page += 1) {
    const response = await getTransactionsPage(token, page)
    if (response?.success === false || response?.sucess === false) {
      throw new Error(response?.textResponse || 'ePayco could not list transactions')
    }
    const rows = response?.data?.data
    const total = Number(response?.data?.pagination?.totalCount)
    if (!Array.isArray(rows) || !Number.isFinite(total)) {
      throw new Error('ePayco returned an incomplete transaction page')
    }
    expectedTotal = total
    for (const row of rows as EpaycoTransaction[]) {
      const id = row.referencePayco
      if (id !== undefined && id !== null) all.set(String(id), row)
    }
    if (all.size >= total) return [...all.values()]
    if (rows.length === 0 || all.size === 0 || page * PAGE_SIZE >= MAX_TRANSACTIONS) break
  }
  throw new Error(`ePayco transaction history is incomplete (${expectedTotal ?? 'unknown'} expected)`)
}

async function getHistoryForKey(apiKey: string) {
  const credentials = parseCredentials(apiKey)
  const token = await getToken(credentials)
  const transactions = await fetchTransactions(token)
  const charges = await Promise.all(transactions
    .filter((transaction) => String(transaction.status || '').trim().toLowerCase() === 'aceptada')
    .map(async (transaction) => {
      const amount = Number(transaction.amount)
      if (!Number.isFinite(amount) || amount < 0) throw new Error('ePayco returned an invalid transaction amount')
      const currency = String(transaction.currency || 'COP').toUpperCase()
      return {
        id: String(transaction.referencePayco),
        amount: await convertToUsd(amount, currency),
        created: toTimestamp(transaction.transactionDate),
      }
    }))

  return {
    charges,
    subscriptions: undefined,
    mrrSnapshot: null,
    revenueTotal: charges.reduce((sum, charge) => sum + charge.amount, 0),
  }
}

function mockHistory() {
  const now = Math.floor(Date.now() / 1000)
  return {
    charges: [
      { id: 'epayco_demo_001', amount: 38, created: now - 20 * 86_400 },
      { id: 'epayco_demo_002', amount: 64, created: now - 4 * 86_400 },
    ],
    subscriptions: undefined,
    mrrSnapshot: null,
    revenueTotal: 102,
  }
}

function failure(error: unknown): ProviderValidationResult {
  const status = (error as any)?.response?.status ?? (error as any)?.statusCode
  return { valid: false, mrr: null, currency: 'USD', error: status === 401 || status === 403 ? 'invalid_key' : 'api_error' }
}

export const epaycoService: PaymentProviderService = {
  async validate(apiKey) {
    if (apiKey === 'epayco_test_facto') return { valid: true, mrr: null, currency: 'USD' }
    try {
      await getHistoryForKey(apiKey)
      return { valid: true, mrr: null, currency: 'USD' }
    } catch (error) { return failure(error) }
  },
  async getMrr(apiKey) {
    if (apiKey === 'epayco_test_facto') return { valid: true, mrr: null, currency: 'USD' }
    try {
      await getHistoryForKey(apiKey)
      return { valid: true, mrr: null, currency: 'USD' }
    } catch (error) { return failure(error) }
  },
  async getHistory(apiKey) {
    return apiKey === 'epayco_test_facto' ? mockHistory() : getHistoryForKey(apiKey)
  },
}
