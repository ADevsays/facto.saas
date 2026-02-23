import { ref, computed } from 'vue';
import { SPANISH_SPEAKING_COUNTRIES } from '../const/languages';
import es from '../locales/es.json';
import en from '../locales/en.json';

const language = ref('es');
const country = ref('');

export function useLanguage() {
  const t = computed(() => {
    return language.value === 'es' ? es : en;
  });

  const detectLanguage = async () => {
    try {
      // 1. Intentamos obtener la ubicación desde nuestro propio servidor (Vercel Optimized)
      const internalGeo = await $fetch('/api/geoip');
      
      if (internalGeo.country) {
        country.value = internalGeo.country;
        language.value = internalGeo.language || 'es';
        return;
      }

      // 2. Fallback: Si no estamos en Vercel (local dev) o falló, usamos API externa
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      country.value = data.country_code;
      language.value = SPANISH_SPEAKING_COUNTRIES.includes(country.value) ? 'es' : 'en';
      
    } catch (error) {
      console.error('[LanguageManager] Error detecting location:', error);
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'es';
      language.value = browserLang === 'en' ? 'en' : 'es';
    }
  };

  return {
    language,
    country,
    t,
    detectLanguage
  };
}
