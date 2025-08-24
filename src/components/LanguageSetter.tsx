'use client';

import { useEffect } from 'react';
import type { Locale } from '@/dictionaries';

interface LanguageSetterProps {
  language: Locale;
}

export const LanguageSetter = ({ language }: LanguageSetterProps) => {
  useEffect(() => {
    // Set the document language attribute
    document.documentElement.lang = language;
  }, [language]);

  return null;
};
