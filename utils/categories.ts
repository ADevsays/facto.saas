export const CATEGORY_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  'marketing': { es: 'Marketing', en: 'Marketing' },
  'ai': { es: 'IA', en: 'AI' },
  'big-data': { es: 'Big Data', en: 'Big Data' },
  'gestion': { es: 'Gestión', en: 'Management' },
  'ventas': { es: 'Ventas', en: 'Sales' },
  'finanzas': { es: 'Finanzas', en: 'Finance' },
  'animales': { es: 'Animales', en: 'Animals' },
  'envios': { es: 'Envíos', en: 'Shipping' },
  'negocios': { es: 'Negocios', en: 'Business' },
  'salud': { es: 'Salud y Bienestar', en: 'Health & Wellness' },
  'productividad': { es: 'Productividad', en: 'Productivity' },
  'musica': { es: 'Música', en: 'Music' },
  'mensajes': { es: 'Mensajería', en: 'Messaging' },
  'seguridad': { es: 'Seguridad', en: 'Security' },
  'restaurantes': { es: 'Restaurantes', en: 'Restaurants' },
  'crm': { es: 'CRM', en: 'CRM' },
  'design': { es: 'Diseño', en: 'Design' },
  'payments': { es: 'Pagos', en: 'Payments' },
  'infrastructure': { es: 'Infraestructura', en: 'Infrastructure' },
  'video': { es: 'Video', en: 'Video' },
  'dev-tools': { es: 'Herramientas de Desarrollo', en: 'Dev Tools' },
  'analytics': { es: 'Analítica', en: 'Analytics' },
  'other': { es: 'Otros', en: 'Other' },
}

export function getCategoryDisplayName(slug: string, fallbackName: string, locale: string): string {
  const normalizedSlug = slug?.toLowerCase()?.trim()
  if (normalizedSlug && CATEGORY_TRANSLATIONS[normalizedSlug]) {
    return locale === 'en' ? CATEGORY_TRANSLATIONS[normalizedSlug].en : CATEGORY_TRANSLATIONS[normalizedSlug].es
  }
  return fallbackName
}
