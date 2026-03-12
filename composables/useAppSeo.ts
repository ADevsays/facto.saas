interface SeoConfig {
  title: () => string;
  description: () => string;
  imagePath: string;
}

export function useAppSeo(config: SeoConfig) {
  const url = useRequestURL();
  const i18nHead = useLocaleHead({ lang: true, dir: true, seo: true });
  const siteUrl = 'https://factosaas.com';
  const canonicalHref = () => `${siteUrl}${url.pathname}`;

  useHead({
    htmlAttrs: {
      lang: () => i18nHead.value.htmlAttrs?.lang ?? 'es',
      dir: () => (i18nHead.value.htmlAttrs?.dir as 'ltr' | 'rtl' | 'auto') ?? 'ltr',
    },
    link: () => [
      ...(i18nHead.value.link ?? []),
      { rel: 'canonical', href: canonicalHref },
    ],
    meta: () => i18nHead.value.meta ?? [],
  });

  const imageUrl = () => {
    const cleanPath = config.imagePath.startsWith('/') ? config.imagePath : `/${config.imagePath}`;
    return `${siteUrl}${cleanPath}?v=2`;
  };

  useSeoMeta({
    title: config.title,
    ogTitle: config.title,
    description: config.description,
    ogDescription: config.description,
    ogImage: imageUrl,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogType: 'website',
    ogUrl: canonicalHref,
    twitterCard: 'summary_large_image',
    twitterSite: '@Adevsays569',
    twitterCreator: '@Adevsays569',
    twitterTitle: config.title,
    twitterDescription: config.description,
    twitterImage: imageUrl,
  });
}
