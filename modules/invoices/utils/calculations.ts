import type { InvoiceItem } from '../types'

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((acc, i) => acc + (Number(i.qty) || 0) * (Number(i.price) || 0), 0)
}

export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return subtotal * ((Number(taxRate) || 0) / 100)
}

export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount
}

export function computeInvoiceSummary(items: InvoiceItem[], taxRate: number) {
  const subtotal = calculateSubtotal(items)
  const taxAmount = calculateTaxAmount(subtotal, taxRate)
  const total = calculateTotal(subtotal, taxAmount)
  return { subtotal, taxAmount, total }
}
