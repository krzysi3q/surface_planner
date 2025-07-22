import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'pl', 'es', 'zh'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get locale from Accept-Language header or use default
    const locale = getLocaleFromHeaders(request) || defaultLocale;
    
    // Special case for root path
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
    
    // For other paths, prepend the locale
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}

function getLocaleFromHeaders(request: NextRequest): string | null {
  // Get locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;
  
  // Parse Accept-Language header and find supported locale
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase());
  
  for (const lang of languages) {
    // Check for exact match
    if (locales.includes(lang)) {
      return lang;
    }
    
    // Check for language prefix match (e.g., 'en-US' -> 'en')
    const langPrefix = lang.split('-')[0];
    if (locales.includes(langPrefix)) {
      return langPrefix;
    }
  }
  
  return null;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    // Skip all API routes
    // Skip all files with extensions
    '/((?!_next|api|.*\\..*).*)',
  ],
};
