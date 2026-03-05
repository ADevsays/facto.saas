import { SPANISH_SPEAKING_COUNTRIES } from '~/utils/languages';

export default defineEventHandler((event) => {
  // En producción (Vercel), el país viene en este header
  // En desarrollo local, este header no existe (usamos un fallback o detectamos IP)
  const countryCode = getHeader(event, 'x-vercel-ip-country');
  
  if (countryCode) {
    const language = SPANISH_SPEAKING_COUNTRIES.includes(countryCode) ? 'es' : 'en';
    return {
      country: countryCode,
      language,
      source: 'vercel'
    };
  }

  // Fallback para local o si no estamos en Vercel
  return {
    country: null,
    language: null,
    source: 'none'
  };
});
