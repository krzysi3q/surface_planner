'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, useParams } from 'next/navigation';
import { Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LanguagePage() {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const params = useParams();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    router.push(`/${languageCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* App Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-orange-100 rounded-xl shadow-lg p-2 flex items-center justify-center">
            <Image src={"/app-icon.png"} alt={t('app.icon')} width={48} height={48} className="w-12 h-12" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <Globe className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('language.switchLanguage')}
          </h1>
          <p className="text-gray-600 text-sm">
            {t('language.choosePreferred')}
          </p>
        </div>

        {/* Language Options */}
        <div className="space-y-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                params.lang === language.code
                  ? 'border-orange-600 bg-orange-50 text-orange-800'
                  : 'border-gray-200 hover:border-orange-300 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-8">
          {t('language.changeSettingsLater')}
        </p>
      </div>
    </div>
  );
}
