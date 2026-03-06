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
    }
  };
}
