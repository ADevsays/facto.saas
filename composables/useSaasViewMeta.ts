import es from '~/modules/visuals/locales/es.json'
import en from '~/modules/visuals/locales/en.json'
import { getCategoryDisplayName } from '~/utils/categories'
import { getContinent, CONTINENTS } from '~/utils/continents'

export interface ViewMeta {
  titleStart: string
  titleHighlight: string
  fullTitle: string
  description: string
  seoTitle: string
  seoDescription: string
}

export function useSaasViewMeta() {
  function getLocaleDict(locale = 'es') {
    return locale === 'en' ? en : es
  }

  function getDefaultMeta(locale = 'es'): ViewMeta {
    const dict = getLocaleDict(locale)
    const header = dict.list_header
    const fullTitle = `${header.title_start} ${header.title_highlight}`

    return {
      titleStart: header.title_start,
      titleHighlight: header.title_highlight,
      fullTitle,
      description: header.description,
      seoTitle: header.seo_default_title,
      seoDescription: header.description.replace(/<[^>]*>?/gm, '').trim()
    }
  }

  function getCategoryMeta(slug: string, fallbackName?: string | null, locale = 'es'): ViewMeta {
    const dict = getLocaleDict(locale)
    const header = dict.list_header
    const normalized = (slug || '').toLowerCase().trim()
    const displayName = getCategoryDisplayName(normalized, fallbackName || slug, locale)

    const descriptions = header.category_descriptions as Record<string, string>
    const desc = descriptions[normalized] || descriptions.fallback?.replace('{category}', displayName) || ''

    const titleStart = header.category_title_start
    const titleHighlight = displayName
    const fullTitle = `${titleStart} ${titleHighlight}`
    const seoTitle = header.seo_category_title?.replace('{category}', displayName) || fullTitle

    return {
      titleStart,
      titleHighlight,
      fullTitle,
      description: desc,
      seoTitle,
      seoDescription: desc
    }
  }

  function getCountryMeta(slug: string, fallbackName?: string | null, locale = 'es'): ViewMeta {
    const dict = getLocaleDict(locale)
    const header = dict.list_header
    const countryName = fallbackName || slug

    const titleStart = header.country_title_start
    const titleHighlight = countryName
    const fullTitle = `${titleStart} ${titleHighlight}`
    const desc = header.country_description?.replace('{country}', countryName) || ''
    const seoTitle = header.seo_country_title?.replace('{country}', countryName) || fullTitle

    return {
      titleStart,
      titleHighlight,
      fullTitle,
      description: desc,
      seoTitle,
      seoDescription: desc
    }
  }

  function getContinentMeta(slug: string, locale = 'es'): ViewMeta {
    const cont = getContinent(slug) || CONTINENTS.america
    const continentName = cont.name[locale === 'en' ? 'en' : 'es'] || cont.name.es
    const titleStart = locale === 'en' ? 'Best startups in' : 'Mejores startups de'
    const titleHighlight = continentName
    const fullTitle = `${titleStart} ${titleHighlight}`
    const desc = cont.description[locale === 'en' ? 'en' : 'es'] || cont.description.es
    const seoTitle = cont.seoTitle[locale === 'en' ? 'en' : 'es'] || fullTitle

    return {
      titleStart,
      titleHighlight,
      fullTitle,
      description: desc,
      seoTitle,
      seoDescription: desc
    }
  }

  function getActiveMeta(params: {
    categorySlug?: string | null
    categoryName?: string | null
    countrySlug?: string | null
    countryName?: string | null
    continentSlug?: string | null
    locale?: string
  }): ViewMeta {
    const locale = params.locale || 'es'
    const dict = getLocaleDict(locale)
    const header = dict.list_header

    const hasCategory = !!params.categorySlug && params.categorySlug !== 'all'
    const hasCountry = !!params.countrySlug && params.countrySlug !== 'all' && params.countrySlug !== 'global'
    const hasContinent = !!params.continentSlug

    if (hasCategory && hasCountry) {
      const catMeta = getCategoryMeta(params.categorySlug!, params.categoryName, locale)
      const countryName = params.countryName || params.countrySlug!

      const titleStart = header.combined_title_start?.replace('{category}', catMeta.titleHighlight) || `${catMeta.titleHighlight} in`
      const titleHighlight = countryName
      const fullTitle = `${titleStart} ${titleHighlight}`
      const desc = header.combined_description?.replace('{category}', catMeta.titleHighlight).replace('{country}', countryName) || ''

      return {
        titleStart,
        titleHighlight,
        fullTitle,
        description: desc,
        seoTitle: `${fullTitle} | Facto`,
        seoDescription: desc
      }
    }

    if (hasCategory && hasContinent) {
      const catMeta = getCategoryMeta(params.categorySlug!, params.categoryName, locale)
      const cont = getContinent(params.continentSlug!) || CONTINENTS.america
      const contName = cont.name[locale === 'en' ? 'en' : 'es'] || cont.name.es
      const titleStart = `${catMeta.titleHighlight} ${locale === 'en' ? 'in' : 'en'}`
      const titleHighlight = contName
      const fullTitle = `${titleStart} ${titleHighlight}`
      const desc = `${catMeta.titleHighlight} — ${cont.description[locale === 'en' ? 'en' : 'es'] || cont.description.es}`

      return {
        titleStart,
        titleHighlight,
        fullTitle,
        description: desc,
        seoTitle: `${fullTitle} | Facto`,
        seoDescription: desc
      }
    }

    if (hasCategory) {
      return getCategoryMeta(params.categorySlug!, params.categoryName, locale)
    }

    if (hasCountry) {
      return getCountryMeta(params.countrySlug!, params.countryName, locale)
    }

    if (hasContinent) {
      return getContinentMeta(params.continentSlug!, locale)
    }

    return getDefaultMeta(locale)
  }

  return {
    getDefaultMeta,
    getCategoryMeta,
    getCountryMeta,
    getContinentMeta,
    getActiveMeta
  }
}
