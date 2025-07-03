'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { setLanguageFromUrl } from '@/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLanguage }) => {
  const { i18n } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set initial language from URL if provided
    if (initialLanguage) {
      setLanguageFromUrl(initialLanguage);
    }
    
    // Wait for i18n to be initialized to avoid hydration mismatch
    if (i18n.isInitialized) {
      setIsInitialized(true);
      document.documentElement.lang = i18n.language;
    } else {
      const onInitialized = () => {
        setIsInitialized(true);
        document.documentElement.lang = i18n.language;
      };
      i18n.on('initialized', onInitialized);
      return () => i18n.off('initialized', onInitialized);
    }
  }, [i18n, initialLanguage]);

  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language, isInitialized]);

  // Don't render content until i18n is initialized to prevent hydration mismatch
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
