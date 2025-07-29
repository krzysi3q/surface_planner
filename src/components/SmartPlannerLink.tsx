import Link from 'next/link';
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePathname } from 'next/navigation';

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
  const { i18n } = useTranslation();
  const pathname = usePathname();

  // Get current language from pathname or use current i18n language
  const getCurrentLanguage = () => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    return ['en', 'pl', 'es', 'zh'].includes(firstSegment) ? firstSegment : i18n.language;
  };

  // Create localized href - if we're on root level and no language is explicitly chosen,
  // keep the link without language prefix for SEO
  const createLocalizedHref = () => {
    const segments = pathname.split('/').filter(Boolean);
    const isOnLanguageRoute = ['en', 'pl', 'es', 'zh'].includes(segments[0]);
    
    if (isOnLanguageRoute) {
      // User is on a language-specific route, maintain language in link
      return `/${getCurrentLanguage()}${href}`;
    } else {
      // User is on root level without language prefix, keep it that way for SEO
      // but redirect to language-specific route when clicking
      return `/${getCurrentLanguage()}${href}`;
    }
  };

  const localizedHref = createLocalizedHref();

  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  );
};
