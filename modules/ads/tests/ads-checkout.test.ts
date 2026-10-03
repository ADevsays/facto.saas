import { describe, it } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'

interface ValidateCheckoutInput {
  slot: number
  price?: number | null
  minRequiredPrice: number
}

function validateAndNormalizeCheckout(input: ValidateCheckoutInput) {
  if (!input.slot) {
    throw new Error('El puesto (slot) es obligatorio.')
  }

  const slot = Math.max(1, Math.min(20, Math.floor(input.slot)))

  if (input.price !== undefined && input.price !== null) {
    const requestedPrice = Number(input.price)
    if (isNaN(requestedPrice) || requestedPrice < input.minRequiredPrice) {
      throw new Error(`La puja enviada ($${requestedPrice} USD) es menor a la base mínima requerida ($${input.minRequiredPrice} USD) para el puesto ${slot}.`)
    }
  }

  const price = Math.max(input.minRequiredPrice, Math.floor(Number(input.price) || input.minRequiredPrice))
  const setupToken = crypto.randomUUID()
  const redirectUrl = `https://www.factosaas.com/?ad_setup=true&slot=${slot}&price=${price}&token=${setupToken}`

  return {
    slot,
    price,
    setupToken,
    redirectUrl
  }
}

describe('Ads Checkout Logic & Payload Validation', () => {
  it('should clamp slot number to 1..20 range', () => {
    const resLow = validateAndNormalizeCheckout({ slot: -5, minRequiredPrice: 1 })
    assert.strictEqual(resLow.slot, 1)

    const resHigh = validateAndNormalizeCheckout({ slot: 99, minRequiredPrice: 1 })
    assert.strictEqual(resHigh.slot, 20)

    const resValid = validateAndNormalizeCheckout({ slot: 7, minRequiredPrice: 1 })
    assert.strictEqual(resValid.slot, 7)
  })

  it('should throw error when price is lower than minimum required price for that slot', () => {
    assert.throws(() => {
      validateAndNormalizeCheckout({
        slot: 3,
        price: 4,
        minRequiredPrice: 10
      })
    }, /es menor a la base mínima requerida/)
  })

  it('should accept valid custom bid higher than base price', () => {
    const res = validateAndNormalizeCheckout({
      slot: 2,
      price: 25,
      minRequiredPrice: 5
    })

    assert.strictEqual(res.price, 25)
    assert.strictEqual(res.slot, 2)
    assert.ok(res.redirectUrl.includes('&slot=2'))
    assert.ok(res.redirectUrl.includes('&price=25'))
    assert.ok(res.redirectUrl.includes('&token=' + res.setupToken))
  })

  it('should generate valid UUID v4 setup token', () => {
    const res = validateAndNormalizeCheckout({ slot: 1, minRequiredPrice: 10 })
    assert.match(res.setupToken, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })
})
