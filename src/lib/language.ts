import { headers } from 'next/headers';
import type { Locale } from '@/dictionaries';

const locales: Locale[] = ['en', 'pl', 'es', 'zh'];
const defaultLocale: Locale = 'en';

export async function getLanguageFromHeaders(): Promise<Locale> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  
  // Check for explicit language preference in cookies
  const cookieHeader = headersList.get('cookie');
  const preferredLangMatch = cookieHeader?.match(/preferredLanguage=([^;]+)/);
  if (preferredLangMatch) {
    const cookieLang = preferredLangMatch[1] as Locale;
    if (locales.includes(cookieLang)) {
      return cookieLang;
    }
  }
  
  if (!acceptLanguage) return defaultLocale;
  
  // Parse Accept-Language header with quality values
  // Example: "en-US,en;q=0.9,pl;q=0.8,es;q=0.7"
  const languages = acceptLanguage
    .split(',')
    .map((lang: string) => {
      const [code, qValue] = lang.trim().split(';');
      const quality = qValue ? parseFloat(qValue.split('=')[1]) || 1.0 : 1.0;
      const cleanCode = code.split('-')[0].toLowerCase();
      return { code: cleanCode, quality };
    })
    .sort((a, b) => b.quality - a.quality); // Sort by quality (highest first)
  
  // Find first supported language by quality priority
  for (const { code } of languages) {
    if (locales.includes(code as Locale)) {
      return code as Locale;
    }
  }
  
  return defaultLocale;
}
