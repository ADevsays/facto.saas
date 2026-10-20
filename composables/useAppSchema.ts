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
      const profileUrl = saas.slug ? `https://www.factosaas.com/saas/${saas.slug}` : undefined
      const category = saas.categories?.[0]
      const measuredValues = [
        saas.mrr !== null && saas.mrr !== undefined
          ? { '@type': 'PropertyValue', name: 'Monthly recurring revenue (MRR)', value: saas.mrr, unitText: saas.currency || 'USD' }
          : null,
        saas.allTimeRevenue
          ? { '@type': 'PropertyValue', name: 'All-time revenue', value: saas.allTimeRevenue, unitText: saas.currency || 'USD' }
          : null
      ].filter(Boolean)
      useSchemaOrg([
        {
          '@type': 'SoftwareApplication',
          name: saas.name || 'SaaS',
          url: profileUrl,
          applicationCategory: 'BusinessApplication',
          applicationSubCategory: saas.categories?.[0]?.name || undefined,
          operatingSystem: 'All',
          description: saas.description || saasDescriptionFallback(saas.name || 'this startup'),
          dateModified: saas.updatedAt || saas.publishedAt || undefined,
          image: saas.logoUrl || undefined,
          audience: saas.categories?.[0]?.name
            ? { '@type': 'Audience', audienceType: saas.categories[0].name }
            : undefined,
        },
        {
          '@type': 'Dataset',
          name: `${saas.name || 'SaaS'} public metrics on Facto`,
          url: profileUrl,
          description: saasDescriptionFallback(saas.name || 'this startup'),
          dateModified: saas.updatedAt || saas.publishedAt || undefined,
          measurementTechnique: saas.provider
            ? `Public data synchronized from ${saas.provider}`
            : 'Public data supplied to Facto',
          variableMeasured: measuredValues.length ? measuredValues : undefined,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Facto', item: 'https://www.factosaas.com/' },
            { '@type': 'ListItem', position: 2, name: 'SaaS', item: 'https://www.factosaas.com/saas' },
            ...(category ? [{ '@type': 'ListItem', position: 3, name: category.name, item: `https://www.factosaas.com/saas/categoria/${category.slug}` }] : []),
            { '@type': 'ListItem', position: category ? 4 : 3, name: saas.name || 'SaaS', item: profileUrl }
          ]
        }
      ]);
    }
  };
}

