import { SPANISH_SPEAKING_COUNTRIES } from '~/utils/languages';

export default defineEventHandler((event) => {
  const countryHeader = getHeader(event, 'x-vercel-ip-country') || getHeader(event, 'cf-ipcountry');
  const countryCode = countryHeader ? countryHeader.toUpperCase() : null;

  if (countryCode) {
    const language = SPANISH_SPEAKING_COUNTRIES.includes(countryCode) ? 'es' : 'en';
    return { country: countryCode, language, source: 'header' };
  }

  return { country: null, language: null, source: 'none' };
});
