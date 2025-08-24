'use client';

import React, { useEffect } from 'react';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { I18nProvider } from "@/components/I18nProvider";
import type { Locale } from '@/dictionaries';

interface ClientLanguageWrapperProps {
  language: Locale;
}

export const ClientLanguageWrapper = ({ language }: ClientLanguageWrapperProps) => {
  useEffect(() => {
    // Set the document language attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nProvider initialLanguage={language}>
      <LanguageSwitcher />
    </I18nProvider>
  );
};
