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
    return ['en', 'pl'].includes(firstSegment) ? firstSegment : i18n.language;
  };

  // Create localized href
  const localizedHref = `/${getCurrentLanguage()}${href}`;

  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  );

};
