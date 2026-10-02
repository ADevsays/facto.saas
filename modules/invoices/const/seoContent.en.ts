import type { FaqItem } from '../types'

export const INVOICE_SEO_FAQS: FaqItem[] = [
  {
    question: 'Is the Facto invoice generator free?',
    answer: 'Yes. No limits, no credit card, no account required.'
  },
  {
    question: 'Where is my data saved?',
    answer: 'In your browser. Nothing leaves your device. If you clear your browser data, the invoices disappear. If you do not clear them, they remain.'
  },
  {
    question: 'Can I customize the invoice number, taxes, and currency?',
    answer: 'Yes. Customizable sequential numbering, configurable VAT/GST, and multiple currencies: USD, EUR, MXN, COP, ARS, CLP, PEN, and BRL.'
  },
  {
    question: 'How do I export the invoice to PDF?',
    answer: 'Fill in the details and click "Export PDF". The file downloads in seconds, ready to send.'
  },
  {
    question: 'Does this tool have tax validity or connection to IRS, HMRC, etc?',
    answer: 'No. The generator creates and formats commercial documents in PDF. It is not connected and does not send data to any government tax agency or revenue service.'
  },
  {
    question: 'What is Facto?',
    answer: 'Facto is the leaderboard where SaaS founders publish their verified MRR. If you already have recurring revenue, you can list yourself.'
  }
]

export const INVOICE_SEO_ARTICLES = [
  {
    title: 'Commercial documents without complication',
    highlightWord: 'documents',
    content: `Platforms like Stripe, Gumroad, or LemonSqueezy usually issue a basic receipt. But when an international or B2B client asks for an "invoice" or voucher with your letterhead, business ID, itemized taxes, and bank details, you need to format it properly.

The usual alternative is fighting with a Word template that ends up getting messy.

This generator exists for that gap: clean commercial templates, numbered and exportable to PDF to send to your clients, without accounts or subscriptions.`
  },
  {
    title: 'No automatic tax connection',
    highlightWord: 'connection',
    content: `It is important to clarify that this software is strictly a PDF commercial document formatter. It does not perform electronic stamping or report information to entities like the IRS (USA), HMRC (UK), or the Tax Agency (Spain).

All tax management and reporting derived from these vouchers must be done through your country's official or accounting channels.`
  },
  {
    title: 'Everything stays in your browser',
    highlightWord: 'stays',
    content: `Nothing is sent to any server. Issuer details, clients, and document history are saved in your own browser's localStorage — the same mechanism any website uses to remember your preferences.

If you clear your browser data, the history disappears. If you don't clear it, it remains. You are in control, not a cloud database.`
  }
]
