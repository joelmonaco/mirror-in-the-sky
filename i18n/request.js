import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Get the locale from the request headers
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Default to 'en' if no match found
  const locale = acceptLanguage.includes('de') ? 'de' : 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});