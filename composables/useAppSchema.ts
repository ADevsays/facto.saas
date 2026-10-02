export function useAppSchema() {
  const { locale } = useI18n()

  const orgDescription = () =>
    locale.value === 'es'
      ? 'Directorio verificado de startups SaaS con MRR e ingresos reales. Herramientas gratuitas para founders.'
      : 'Verified SaaS startup directory with real MRR and revenue data. Free tools for founders.'

  const saasDescriptionFallback = (name: string) =>
    locale.value === 'es'
      ? `Descubre los ingresos verificados, MRR y crecimiento de ${name}.`
      : `Discover the verified revenue, MRR and growth of ${name}.`

  const offerDescription = () =>
    locale.value === 'es'
      ? 'Datos públicos verificados en Facto'
      : 'Public data verified on Facto'

  return {
    defineWebSite: (config: { name: string, description: string }) => {
      useSchemaOrg([
        defineWebSite({
          name: config.name,
          description: config.description,
        }),
        defineOrganization({
          name: config.name,
          url: 'https://www.factosaas.com',
          logo: 'https://www.factosaas.com/favicon.svg',
          description: orgDescription(),
          sameAs: [
            'https://x.com/Adevsays569'
          ]
        })
      ]);
    },
    defineSoftwareApp: (config: { name: string, description: string }) => {
      useSchemaOrg([
        {
          '@type': 'SoftwareApplication',
          name: config.name,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          description: config.description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          }
        }
      ]);
    },
    defineSaasProfile: (saas: any) => {
      if (!saas) return;
      useSchemaOrg([
        {
          '@type': 'SoftwareApplication',
          name: saas.name || 'SaaS',
          url: saas.slug ? `https://www.factosaas.com/saas/${saas.slug}` : undefined,
          applicationCategory: 'BusinessApplication',
          applicationSubCategory: saas.categories?.[0]?.name || undefined,
          operatingSystem: 'All',
          description: saas.description || saasDescriptionFallback(saas.name || 'this startup'),
          image: saas.logoUrl || undefined,
          audience: saas.categories?.[0]?.name
            ? { '@type': 'Audience', audienceType: saas.categories[0].name }
            : undefined,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: offerDescription()
          },
        }
      ]);
    }
  };
}

