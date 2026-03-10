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

  const applyLocale = async (detected: string) => {
    const lang = (detected === 'es' ? 'es' : 'en') as 'es' | 'en';
    console.log(`[Lang] applyLocale → detected="${detected}" | resolved="${lang}" | current="${locale.value}" | will change=${lang !== locale.value}`);
    if (lang !== locale.value) {
      await setLocale(lang);
      console.log(`[Lang] setLocale("${lang}") done → locale is now "${locale.value}"`);
    }
  };

  const detectLanguage = async () => {
    console.log(`[Lang] detectLanguage start → current locale="${locale.value}"`);
    const countryCookie = useCookie('app-user-country', { maxAge: 60 * 60 * 24 * 7 });

    if (countryCookie.value) {
      country.value = countryCookie.value;
      const lang = SPANISH_SPEAKING_COUNTRIES.includes(countryCookie.value) ? 'es' : 'en';
      console.log(`[Lang] source=cookie | country="${countryCookie.value}" | lang="${lang}"`);
      await applyLocale(lang);
      return;
    }

    console.log('[Lang] no cookie, calling /api/geoip…');
    try {
      const internalGeo = await $fetch<{ country: string | null; language: string | null }>('/api/geoip');
      console.log('[Lang] /api/geoip response:', internalGeo);

      if (internalGeo.country) {
        country.value = internalGeo.country;
        countryCookie.value = internalGeo.country;
        await applyLocale(internalGeo.language ?? 'en');
        return;
      }

      console.log('[Lang] geoip returned no country, falling back to ipapi.co…');
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      console.log('[Lang] ipapi.co response:', data);

      if (data.country_code) {
        country.value = data.country_code;
        countryCookie.value = data.country_code;
        const lang = SPANISH_SPEAKING_COUNTRIES.includes(data.country_code) ? 'es' : 'en';
        await applyLocale(lang);
      }

    } catch (error) {
      console.error('[Lang] Error detecting location:', error);
    }
  };

  return {
    language,
    country,
    t,
    detectLanguage
  };
}
