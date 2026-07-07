import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiKey = body.apiKey

  if (!apiKey) return { products: [] }

  if (apiKey === 'sk_test_facto') {
    // Mock data for testing without a real Stripe account
    return {
      products: [
        { id: 'prod_test_1', name: 'Startup Alpha (Plan Pro)' },
        { id: 'prod_test_2', name: 'Startup Beta (Standard)' }
      ]
    }
  }

  try {
    const res = await $fetch<any>('https://api.stripe.com/v1/products?active=true&limit=100', {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    return {
      products: (res.data || []).map((p: any) => ({
        id: p.id,
        name: p.name
      }))
    }
  } catch (e) {
    return { error: 'Invalid API Key or missing permissions' }
  }
})
