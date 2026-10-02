import type { ToolItem } from '../types'

export const TOOLS_LIST: ToolItem[] = [
  {
    id: 'youtube-downloader',
    title: 'YouTube Thumbnail Downloader',
    description: 'Extract and inspect thumbnails from any YouTube video in high definition (MaxRes 1080p, SD, HQ) ready to use.',
    icon: 'heroicons:video-camera',
    badge: 'New',
    link: '/herramientas/descargar-miniaturas-youtube',
  },
  {
    id: 'saas-calculator',
    title: 'SaaS Valuation Calculator',
    description: 'Calculate the estimated market value of your startup in seconds based on your current MRR and real industry multiples.',
    icon: 'heroicons:calculator',
    badge: 'Popular',
    link: '/herramientas/cuanto-vale-tu-saas',
  },
  {
    id: 'invoice-generator',
    title: 'Invoice Maker / Generator',
    description: 'Create and download professional, customizable PDF invoices for your global clients with no sign-up.',
    icon: 'heroicons:document-text',
    badge: 'Free',
    link: '/herramientas/generador-de-facturas',
  },
]
