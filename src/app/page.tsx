'use client';

import { I18nProvider } from '@/components/I18nProvider';
import { HomePage } from '@/components/HomePage';

export default function RootPage() {
  return (
    <I18nProvider>
      <HomePage />
    </I18nProvider>
  );
}