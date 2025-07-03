'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const useTranslation = () => {
  const translation = useI18nTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (translation.i18n.isInitialized) {
      setIsReady(true);
    } else {
      const onInitialized = () => setIsReady(true);
      translation.i18n.on('initialized', onInitialized);
      return () => translation.i18n.off('initialized', onInitialized);
    }
  }, [translation.i18n]);

  // Return fallback function that returns keys when not ready
  const t = isReady ? translation.t : (key: string) => key;

  return {
    ...translation,
    t,
    isReady,
  };
};
