export function useAppSchema() {
  return {
    defineWebSite: (config: { name: string, description: string }) => {
      useSchemaOrg([
        defineWebSite({
          name: config.name,
          description: config.description,
        }),
        defineOrganization({
          name: config.name,
          logo: '/favicon.svg',
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
          applicationCategory: saas.categories?.[0]?.name || 'BusinessApplication',
          operatingSystem: 'All',
          description: saas.description || `Descubre los ingresos verificados, MRR y crecimiento de ${saas.name || 'esta startup'}.`,
          offers: {
            '@type': 'Offer',
            price: saas.mrr ? String(saas.mrr) : '0',
            priceCurrency: saas.currency || 'USD',
          },
          image: saas.logoUrl || undefined,
        }
      ]);
    }
  };
}
