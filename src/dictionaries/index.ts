import en from '@/i18n/locales/en.json';
import pl from '@/i18n/locales/pl.json';
import es from '@/i18n/locales/es.json';
import zh from '@/i18n/locales/zh.json';

export type Locale = 'en' | 'pl' | 'es' | 'zh';

const dictionaries = {
  en: () => Promise.resolve(en),
  pl: () => Promise.resolve(pl),
  es: () => Promise.resolve(es),
  zh: () => Promise.resolve(zh),
};

export const getDictionary = async (locale: Locale) => {
  const dict = dictionaries[locale];
  return dict ? await dict() : await dictionaries.en();
};

export const getServerTranslation = (dictionary: Record<string, unknown>) => {
  return (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: unknown = dictionary;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Simple interpolation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };
};
