export interface InvoiceProfile {
  name: string
  email: string
  phone: string
  address: string
  taxId: string
  paymentInfo: string
}

export interface InvoiceClient {
  name: string
  email: string
  address: string
  taxId: string
}

export interface InvoiceItem {
  description: string
  qty: number
  price: number
}

export interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  client: InvoiceClient
  items: InvoiceItem[]
  currency: string
  taxRate: number
  notes: string
  paymentInfo: string
  subtotal: number
  total: number
  createdAt: string
}

export interface InvoiceAppData {
  profile: InvoiceProfile
  invoices: Invoice[]
  nextNumber: number
  currency: string
  taxRate: number
}

export interface FaqItem {
  question: string
  answer: string
}
