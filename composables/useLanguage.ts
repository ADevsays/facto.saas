import { ref, computed } from 'vue';
import { SPANISH_SPEAKING_COUNTRIES } from '@/utils/languages';

const country = ref('');

export function useLanguage(locales?: { es: any, en: any }) {
  const { locale, setLocale } = useI18n();

  // Compatibilidad con código existente que usa language.value
  const language = computed({
    get: () => locale.value,
    set: (val: string) => {
        if (val === 'es' || val === 'en') {
            setLocale(val);
        }
    }
  });

  const t = computed(() => {
    if (!locales) return null;
    return language.value === 'es' ? locales.es : locales.en;
  });

  const switchLocalePath = useSwitchLocalePath();

  const applyLocale = async (detected: string) => {
    const lang = (detected === 'es' ? 'es' : 'en') as 'es' | 'en';
    
    if (lang !== locale.value) {
      const targetPath = switchLocalePath(lang);
      await setLocale(lang);
      const currentPath = useRoute().fullPath;
      if (targetPath && targetPath !== currentPath) {
        await navigateTo(targetPath);
      }
    }
  };

  const detectLanguage = async () => {
    const countryCookie = useCookie('app-user-country', { maxAge: 60 * 60 * 24 * 7 });

    try {
      // 1. Prioritize internal geoip (Vercel / Cloudflare headers reflect current VPN / network immediately)
      const internalGeo = await $fetch<{ country: string | null; language: string | null }>('/api/geoip');

      if (internalGeo && internalGeo.country) {
        country.value = internalGeo.country;
        countryCookie.value = internalGeo.country;
        const lang = internalGeo.language ?? (SPANISH_SPEAKING_COUNTRIES.includes(internalGeo.country) ? 'es' : 'en');
        await applyLocale(lang);
        return;
      }

      // 2. If no server header (e.g. local dev), check cookie fallback
      if (countryCookie.value) {
        country.value = countryCookie.value;
        const isSpanish = SPANISH_SPEAKING_COUNTRIES.includes(countryCookie.value);
        const lang = isSpanish ? 'es' : 'en';
        await applyLocale(lang);
        return;
      }

      // 3. Fallback external IP service for local development
      const response = await fetch('https://ipwho.is/');
      const data = await response.json();

      if (data && data.success && data.country_code) {
        country.value = data.country_code;
        countryCookie.value = data.country_code;
        const isSpanish = SPANISH_SPEAKING_COUNTRIES.includes(data.country_code);
        const lang = isSpanish ? 'es' : 'en';
        await applyLocale(lang);
        return;
      }

      // 4. Browser language fallback
      const browserLang = (typeof navigator !== 'undefined' ? (navigator.language || (navigator as any).userLanguage || 'es') : 'es').toLowerCase();
      const detectedLang = browserLang.startsWith('es') ? 'es' : 'en';
      await applyLocale(detectedLang);

    } catch (error) {
      const browserLang = (typeof navigator !== 'undefined' ? (navigator.language || (navigator as any).userLanguage || 'es') : 'es').toLowerCase();
      const detectedLang = browserLang.startsWith('es') ? 'es' : 'en';
      await applyLocale(detectedLang);
    }
  };

  return {
    locale,
    language,
    country,
    t,
    detectLanguage
  };
}
