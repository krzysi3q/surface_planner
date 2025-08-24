import Link from 'next/link';
import React from 'react';

interface SimpleServerLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  language?: string;
}

export const SimpleServerLink: React.FC<SimpleServerLinkProps> = ({ 
  href, 
  children, 
  className = '',
  language = 'en'
}) => {
  // For server-side rendering, always create language-specific links
  const localizedHref = `/${language}${href}`;

  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  );
};
