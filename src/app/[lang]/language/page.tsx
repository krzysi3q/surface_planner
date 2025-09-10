import type { Metadata } from 'next';
import { 
  generatePageMetadata, 
  languagePageTitles, 
  languagePageDescriptions, 
  homePageKeywords 
} from '@/lib/metadata';
import LanguagePageClient from './LanguagePageClient';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const title = languagePageTitles[lang as keyof typeof languagePageTitles] || languagePageTitles.en;
  const description = languagePageDescriptions[lang as keyof typeof languagePageDescriptions] || languagePageDescriptions.en;
  const keywords = homePageKeywords[lang as keyof typeof homePageKeywords] || homePageKeywords.en;

  return generatePageMetadata({
    title,
    description,
    keywords,
    path: '/language',
    lang
  });
}

export default function LanguagePage() {
  return <LanguagePageClient />;
}
