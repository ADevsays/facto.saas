export interface Continent {
  slug: string
  name: {
    es: string
    en: string
  }
  title: {
    es: string
    en: string
  }
  seoTitle: {
    es: string
    en: string
  }
  description: {
    es: string
    en: string
  }
  countrySlugs: string[]
}

export const CONTINENTS: Record<string, Continent> = {
  america: {
    slug: 'america',
    name: {
      es: 'América',
      en: 'America'
    },
    title: {
      es: 'Mejores startups de América',
      en: 'Best Startups in America'
    },
    seoTitle: {
      es: 'Mejores Startups de América — Facturación Real & Ranking SaaS | Facto',
      en: 'Best Startups in America — Real Revenue & SaaS Ranking | Facto'
    },
    description: {
      es: 'Descubre las startups y empresas de software más destacadas y rentables de América con métricas de facturación real verificadas en Facto.',
      en: 'Discover the most prominent and profitable SaaS startups in America with verified real revenue metrics on Facto.'
    },
    countrySlugs: [
      'argentina', 'bolivia', 'brasil', 'canada', 'chile', 'colombia',
      'costa-rica', 'cuba', 'ecuador', 'el-salvador', 'estados-unidos',
      'guatemala', 'honduras', 'mexico', 'nicaragua', 'panama',
      'paraguay', 'peru', 'puerto-rico', 'republica-dominicana',
      'uruguay', 'venezuela'
    ]
  },
  europa: {
    slug: 'europa',
    name: {
      es: 'Europa',
      en: 'Europe'
    },
    title: {
      es: 'Mejores startups de Europa',
      en: 'Best Startups in Europe'
    },
    seoTitle: {
      es: 'Mejores Startups de Europa — Facturación Real & Ranking SaaS | Facto',
      en: 'Best Startups in Europe — Real Revenue & SaaS Ranking | Facto'
    },
    description: {
      es: 'Descubre las startups y empresas de software más destacadas y rentables de Europa con métricas de facturación real verificadas en Facto.',
      en: 'Discover the most prominent and profitable SaaS startups in Europe with verified real revenue metrics on Facto.'
    },
    countrySlugs: [
      'alemania', 'andorra', 'austria', 'belgica', 'bulgaria', 'chipre',
      'croacia', 'dinamarca', 'eslovaquia', 'eslovenia', 'espana', 'estonia',
      'finlandia', 'francia', 'grecia', 'hungria', 'irlanda', 'islandia',
      'italia', 'letonia', 'lituania', 'luxemburgo', 'malta', 'monaco',
      'noruega', 'paises-bajos', 'polonia', 'portugal', 'reino-unido',
      'republica-checa', 'rumania', 'serbia', 'suecia', 'suiza', 'ucrania'
    ]
  },
  asia: {
    slug: 'asia',
    name: {
      es: 'Asia',
      en: 'Asia'
    },
    title: {
      es: 'Mejores startups de Asia',
      en: 'Best Startups in Asia'
    },
    seoTitle: {
      es: 'Mejores Startups de Asia — Facturación Real & Ranking SaaS | Facto',
      en: 'Best Startups in Asia — Real Revenue & SaaS Ranking | Facto'
    },
    description: {
      es: 'Descubre las startups y empresas de software más destacadas y rentables de Asia con métricas de facturación real verificadas en Facto.',
      en: 'Discover the most prominent and profitable SaaS startups in Asia with verified real revenue metrics on Facto.'
    },
    countrySlugs: [
      'arabia-saudita', 'china', 'corea-del-sur', 'emiratos-arabes-unidos',
      'filipinas', 'hong-kong', 'india', 'indonesia', 'israel', 'japon',
      'malasia', 'qatar', 'singapur', 'tailandia', 'taiwan', 'turquia', 'vietnam'
    ]
  }
}

export function getContinent(slug: string): Continent | undefined {
  const normalized = (slug || '').toLowerCase().trim()
  if (normalized === 'europe') return CONTINENTS.europa
  return CONTINENTS[normalized]
}

export function getContinentList(): Continent[] {
  return Object.values(CONTINENTS)
}

export function getContinentForCountry(countrySlug: string): Continent | undefined {
  const normalized = (countrySlug || '').toLowerCase().trim()
  return Object.values(CONTINENTS).find(continent => continent.countrySlugs.includes(normalized))
}
