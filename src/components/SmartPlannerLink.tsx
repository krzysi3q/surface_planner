'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePathname } from 'next/navigation';
import { Smartphone, Monitor, X } from 'lucide-react';
import { useTouchDevice } from '@/hooks/useTouchDevice';

interface SmartPlannerLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SmartPlannerLink: React.FC<SmartPlannerLinkProps> = ({ 
  href, 
  children, 
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const isTouchDevice = useTouchDevice();
  const [showWarning, setShowWarning] = useState(false);

  // Get current language from pathname or use current i18n language
  const getCurrentLanguage = () => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    return ['en', 'pl'].includes(firstSegment) ? firstSegment : i18n.language;
  };

  // Create localized href
  const localizedHref = `/${getCurrentLanguage()}${href}`;

  const handleClick = (e: React.MouseEvent) => {
    if (isTouchDevice) {
      e.preventDefault();
      setShowWarning(true);
    }
  };

  if (!isTouchDevice) {
    return (
      <Link href={localizedHref} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button 
        onClick={handleClick}
        className={className}
      >
        {children}
      </button>
      
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Smartphone className="w-12 h-12 text-orange-500" />
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {t('touchDevice.title')}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {t('touchDevice.shortDescription')}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                <Monitor className="w-4 h-4" />
                <span>{t('touchDevice.recommendation')}</span>
              </div>
              
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                {t('touchDevice.gotIt')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
