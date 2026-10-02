export function generateInvoiceNumber(nextNumber: number): string {
  const year = new Date().getFullYear()
  const num = String(nextNumber).padStart(4, '0')
  return `INV-${year}-${num}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function dueDateISO(days = 30): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}
