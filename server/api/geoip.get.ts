import { SPANISH_SPEAKING_COUNTRIES } from '~/utils/languages';

export default defineEventHandler((event) => {
  const countryCode = getHeader(event, 'x-vercel-ip-country');

  if (countryCode) {
    const language = SPANISH_SPEAKING_COUNTRIES.includes(countryCode) ? 'es' : 'en';
    return { country: countryCode, language, source: 'vercel' };
  }

  
  return { country: null, language: null, source: 'none' };
});
