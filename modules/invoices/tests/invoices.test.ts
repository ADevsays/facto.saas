import { describe, it } from 'node:test'
import assert from 'node:assert'
import { calculateSubtotal, calculateTaxAmount, calculateTotal, computeInvoiceSummary } from '../utils/calculations'
import { generateInvoiceNumber, formatDate, todayISO, dueDateISO } from '../utils/formatters'
import { formatCurrency, formatShort, CURRENCIES } from '../const/currencies'
import type { InvoiceItem } from '../types'

describe('Invoice Calculations (DRY)', () => {
  it('should calculate correct subtotal for multiple items', () => {
    const items: InvoiceItem[] = [
      { description: 'Web Design', qty: 2, price: 500 },
      { description: 'Hosting', qty: 1, price: 150 }
    ]
    const subtotal = calculateSubtotal(items)
    assert.strictEqual(subtotal, 1150)
  })

  it('should handle invalid or zero numbers gracefully in subtotal', () => {
    const items: InvoiceItem[] = [
      { description: 'Empty', qty: 0, price: 500 },
      { description: 'Valid', qty: 1, price: 200 }
    ]
    assert.strictEqual(calculateSubtotal(items), 200)
  })

  it('should calculate correct tax amount', () => {
    const subtotal = 1000
    const taxRate = 16
    const taxAmount = calculateTaxAmount(subtotal, taxRate)
    assert.strictEqual(taxAmount, 160)
  })

  it('should compute complete invoice summary accurately', () => {
    const items: InvoiceItem[] = [
      { description: 'SaaS License', qty: 3, price: 100 }
    ]
    const summary = computeInvoiceSummary(items, 20)
    assert.strictEqual(summary.subtotal, 300)
    assert.strictEqual(summary.taxAmount, 60)
    assert.strictEqual(summary.total, 360)
  })
})

describe('Invoice Formatters', () => {
  it('should generate formatted invoice number with padding', () => {
    const num1 = generateInvoiceNumber(1)
    const year = new Date().getFullYear()
    assert.strictEqual(num1, `INV-${year}-0001`)

    const num42 = generateInvoiceNumber(42)
    assert.strictEqual(num42, `INV-${year}-0042`)
  })

  it('should format ISO dates correctly to Spanish locale', () => {
    const formatted = formatDate('2026-07-30')
    assert.ok(formatted.includes('2026'))
    assert.ok(formatted.toLowerCase().includes('jul') || formatted.includes('07') || formatted.includes('30'))
  })

  it('should return valid ISO string for todayISO and dueDateISO', () => {
    const today = todayISO()
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/)

    const due = dueDateISO(30)
    assert.match(due, /^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('Currencies Const', () => {
  it('should include major international currencies', () => {
    const codes = CURRENCIES.map(c => c.code)
    assert.ok(codes.includes('USD'))
    assert.ok(codes.includes('EUR'))
    assert.ok(codes.includes('MXN'))
    assert.ok(codes.includes('COP'))
  })

  it('should format short and full currency strings correctly', () => {
    const shortUSD = formatShort(1250.5, 'USD')
    assert.ok(shortUSD.includes('$'))
    assert.ok(shortUSD.includes('1.250,50') || shortUSD.includes('1,250.50') || shortUSD.includes('1250'))

    const fullEUR = formatCurrency(500, 'EUR')
    assert.ok(fullEUR.includes('€'))
    assert.ok(fullEUR.includes('EUR'))
  })
})
