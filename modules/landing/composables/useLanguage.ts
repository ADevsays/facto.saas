import { ref } from 'vue';
import { SPANISH_SPEAKING_COUNTRIES } from '../const/languages';

export function useLanguage() {
  const language = ref('en');
  const country = ref('');

  const detectLanguage = async () => {
    try {
      // 1. Intentamos obtener la ubicación desde nuestro propio servidor (Vercel Optimized)
      const internalGeo = await $fetch('/api/geoip');
      
      if (internalGeo.country) {
        country.value = internalGeo.country;
        language.value = internalGeo.language || 'en';
        console.log(`[LanguageManager] detected via Vercel: ${country.value}`);
        return;
      }

      // 2. Fallback: Si no estamos en Vercel (local dev) o falló, usamos API externa
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      country.value = data.country_code;
      language.value = SPANISH_SPEAKING_COUNTRIES.includes(country.value) ? 'es' : 'en';

      console.log(`[LanguageManager] detected via Fallback (API): ${country.value}`);
      console.log(`[LanguageManager] Default language: ${language.value}`);
      
    } catch (error) {
      console.error('[LanguageManager] Error detecting location:', error);
      const browserLang = navigator.language.split('-')[0];
      language.value = browserLang === 'es' ? 'es' : 'en';
      console.log(`[LanguageManager] Fallback (Browser): ${language.value}`);
    }
  };

  return {
    language,
    country,
    detectLanguage
  };
}
