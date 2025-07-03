import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import pl from './locales/pl.json';

const resources = {
  en: {
    translation: en
  },
  pl: {
    translation: pl
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false, // Disable suspense to avoid SSR issues
    },
  });

// Helper function to set language from URL
export const setLanguageFromUrl = (lang: string) => {
  if (['en', 'pl'].includes(lang) && i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }
};

export default i18n;
