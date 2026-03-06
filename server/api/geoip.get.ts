import { SPANISH_SPEAKING_COUNTRIES } from '~/utils/languages';

export default defineEventHandler((event) => {
  // En producción (Vercel), el país viene en este header
  const countryCode = getHeader(event, 'x-vercel-ip-country');
  
  if (countryCode) {
    const language = SPANISH_SPEAKING_COUNTRIES.includes(countryCode) ? 'es' : 'en';
    return {
      country: countryCode,
      language,
      source: 'vercel'
    };
  }

  // Mock para desarrollo local (localhost)
  if (process.dev) {
    return {
      country: 'ES',
      language: 'es',
      source: 'local-mock'
    };
  }

  // Fallback para otros entornos
  return {
    country: null,
    language: null,
    source: 'none'
  };
});
