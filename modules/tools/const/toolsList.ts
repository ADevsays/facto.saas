import type { ToolItem } from '../types'

export const TOOLS_LIST: ToolItem[] = [
  {
    id: 'youtube-downloader',
    title: 'Descargador de Miniaturas YouTube',
    description: 'Extrae e inspecciona miniaturas de cualquier video de YouTube en alta definición (MaxRes 1080p, SD, HQ) listo para usar.',
    icon: 'heroicons:video-camera',
    badge: 'Nuevo',
    link: '/herramientas/descargar-miniaturas-youtube',
  },
  {
    id: 'saas-calculator',
    title: 'Calculadora de Valoración SaaS',
    description: 'Calcula el valor de mercado estimado de tu startup en segundos según tu MRR actual y múltiplos reales del sector.',
    icon: 'heroicons:calculator',
    badge: 'Popular',
    link: '/herramientas/cuanto-vale-tu-saas',
  },
  {
    id: 'invoice-generator',
    title: 'Emisor / Generador de Facturas',
    description: 'Crea y descarga facturas en PDF profesionales y personalizadas para tus clientes globales sin registro.',
    icon: 'heroicons:document-text',
    badge: 'Gratis',
    link: '/herramientas/generador-de-facturas',
  },
]
