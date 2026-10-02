export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso colombiano' },
  { code: 'ARS', symbol: '$', name: 'Peso argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso chileno' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonés' },
]

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  const formatted = new Intl.NumberFormat('es', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${currency.symbol}${formatted} ${currency.code}`
}

export function formatShort(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  const formatted = new Intl.NumberFormat('es', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${currency.symbol}${formatted}`
}
