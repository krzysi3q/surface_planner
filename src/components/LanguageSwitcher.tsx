'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLanguage: string) => {
    // Extract current path without language prefix
    const segments = pathname.split('/').filter(Boolean);
    const currentLang = segments[0];
    
    // Check if current first segment is a language code
    const isCurrentLangInPath = ['en', 'pl', 'es', 'zh'].includes(currentLang);
    
    let newPath: string;
    if (isCurrentLangInPath) {
      // Replace current language with new language
      segments[0] = newLanguage;
      newPath = '/' + segments.join('/');
    } else {
      // We're on root level, redirect to language-specific URL
      if (pathname === '/') {
        newPath = `/${newLanguage}`;
      } else {
        // Prepend new language to current path
        newPath = `/${newLanguage}${pathname}`;
      }
    }
    
    // Update i18n language
    i18n.changeLanguage(newLanguage);
    
    // Navigate to new path
    router.push(newPath);
  };

  const openLanguagePage = () => {
    // Extract current path without language prefix
    const segments = pathname.split('/').filter(Boolean);
    const currentLang = segments[0];
    const isCurrentLangInPath = ['en', 'pl', 'es', 'zh'].includes(currentLang);
    
    const langPath = isCurrentLangInPath ? `/${currentLang}/language` : `/${i18n.language}/language`;
    router.push(langPath);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <Globe className="w-4 h-4 text-gray-600" />
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
          aria-label={t('language.switchLanguage')}
        >
          <option value="en">{t('language.english')}</option>
          <option value="pl">{t('language.polish')}</option>
          <option value="es">{t('language.spanish')}</option>
          <option value="zh">{t('language.chinese')}</option>
        </select>
        {/* Alternative button to open full language page */}
        <button 
          onClick={openLanguagePage}
          className="ml-2 p-1 hover:bg-gray-200 rounded text-xs opacity-60 hover:opacity-100 transition"
          title={t('language.moreOptions')}
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};
