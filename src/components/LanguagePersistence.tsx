'use client';

import { useEffect } from 'react';
import type { Locale } from '@/dictionaries';

interface LanguagePersistenceProps {
  language: Locale;
}

export const LanguagePersistence = ({ language }: LanguagePersistenceProps) => {
  useEffect(() => {
    // Store the detected language for future visits
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('preferredLanguage');
      
      // If this is the first visit or the detected language is different, update storage
      if (!storedLang || storedLang !== language) {
        localStorage.setItem('preferredLanguage', language);
        
        // Also set a cookie for server-side detection
        document.cookie = `preferredLanguage=${language}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }
      
      // Set the document language attribute for screen readers and SEO
      document.documentElement.lang = language;
    }
  }, [language]);

  return null; // This component doesn't render anything
};
