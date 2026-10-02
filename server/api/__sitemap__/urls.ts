import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async () => {
  const { data } = await supabase
    .from('saas_entries')
    .select('slug, published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  let urls: any[] = []

  // Static bilingual routes
  const staticRoutes = [
    { es: '/herramientas', en: '/en/tools' },
    { es: '/categorias', en: '/en/categories' },
    { es: '/paises', en: '/en/countries' },
    { es: '/herramientas/cuanto-vale-tu-saas', en: '/en/tools/how-much-is-your-saas-worth' },
    { es: '/herramientas/generador-de-facturas', en: '/en/tools/invoice-generator' },
    { es: '/herramientas/descargar-miniaturas-youtube', en: '/en/tools/youtube-thumbnail-downloader' }
  ]

  for (const route of staticRoutes) {
    const alternatives = [
      { hreflang: 'es', href: `https://www.factosaas.com${route.es}` },
      { hreflang: 'en', href: `https://www.factosaas.com${route.en}` },
      { hreflang: 'x-default', href: `https://www.factosaas.com${route.es}` }
    ]
    urls.push({ loc: route.es, alternatives })
    urls.push({ loc: route.en, alternatives })
  }

  if (data) {
    for (const entry of data) {
      const esLoc = `/saas/${entry.slug}`
      const enLoc = `/en/saas/${entry.slug}`
      const alternatives = [
        { hreflang: 'es', href: `https://www.factosaas.com${esLoc}` },
        { hreflang: 'en', href: `https://www.factosaas.com${enLoc}` },
        { hreflang: 'x-default', href: `https://www.factosaas.com${esLoc}` }
      ]

      urls.push({
        loc: esLoc,
        lastmod: entry.published_at ?? undefined,
        alternatives
      })
      urls.push({
        loc: enLoc,
        lastmod: entry.published_at ?? undefined,
        alternatives
      })
    }
  }

  return urls
})
