interface SeoConfig {
  title: string | (() => string);
  description: string | (() => string);
  imagePath: string | (() => string);
}

export function useAppSeo(config: SeoConfig) {
  const url = useRequestURL();
  const i18nHead = useLocaleHead({
    addSeoAttributes: true,
    identifierAttribute: 'id',
    addDirAttribute: true
  });
  
  const getVal = (val: string | (() => string)) => typeof val === 'function' ? val() : val;

  useHead({
    htmlAttrs: {
      lang: i18nHead.value.htmlAttrs?.lang,
      dir: i18nHead.value.htmlAttrs?.dir,
    },
    link: [
      ...(i18nHead.value.link || []),
      {
        rel: 'canonical',
        href: () => url.href,
      },
    ],
    meta: [
      ...(i18nHead.value.meta || []),
    ],
  });

  useSeoMeta({
    title: config.title,
    ogTitle: config.title,
    description: config.description,
    ogDescription: config.description,
    ogImage: () => {
      const path = getVal(config.imagePath);
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${url.origin}${cleanPath}?v=2`;
    },
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogType: 'website',
    ogUrl: () => url.href,
    twitterCard: 'summary_large_image',
    twitterSite: '@Adevsays569',
    twitterCreator: '@Adevsays569',
    twitterTitle: config.title,
    twitterDescription: config.description,
    twitterImage: () => {
      const path = getVal(config.imagePath);
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${url.origin}${cleanPath}?v=2`;
    },
  });
}
