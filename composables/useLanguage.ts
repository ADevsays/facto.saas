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

  const detectLanguage = async () => {
    // 1. Intentar obtener el país de la cookie primero (Caché Cliente)
    const countryCookie = useCookie('app-user-country', { maxAge: 60 * 60 * 24 * 7 }); // 7 días
    
    if (countryCookie.value) {
      country.value = countryCookie.value;
      return;
    }

    // Si ya estamos en una ruta con prefijo, el módulo i18n ya detectó el idioma
    // Solo ejecutamos detección extra si estamos en la raíz o necesitamos el país
    
    try {
      // 2. Intentar con nuestra API interna (Vercel GeoIP)
      const internalGeo = await $fetch<any>('/api/geoip');
      
      if (internalGeo.country) {
        country.value = internalGeo.country;
        countryCookie.value = internalGeo.country; // Guardar en cookie

        if (!locale.value || locale.value === 'en') { // Solo cambiar si es el default y detectamos algo más específico
             const detected = internalGeo.language || 'es';
             if (detected !== locale.value) {
                 await setLocale(detected);
             }
        }
        return;
      }

      // 3. Fallback externo (solo si lo anterior falla y no hay cookie)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_code) {
        country.value = data.country_code;
        countryCookie.value = data.country_code; // Guardar en cookie
        
        const detectedLang = SPANISH_SPEAKING_COUNTRIES.includes(country.value) ? 'es' : 'en';
        if (detectedLang !== locale.value) {
            await setLocale(detectedLang);
        }
      }
      
    } catch (error) {
      console.error('[LanguageManager] Error detecting location:', error);
    }
  };

  return {
    language,
    country,
    t,
    detectLanguage
  };
}
