import type { Metadata } from 'next';
import { HomePageServer } from '@/components/HomePageServer';
import { getDictionary, type Locale } from '@/dictionaries';
import { 
  generatePageMetadata, 
  homePageTitles, 
  homePageDescriptions, 
  homePageKeywords 
} from '@/lib/metadata';

interface PageProps {
  params: Promise<{ lang: string }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const title = homePageTitles[lang as keyof typeof homePageTitles] || homePageTitles.en;
  const description = homePageDescriptions[lang as keyof typeof homePageDescriptions] || homePageDescriptions.en;
  const keywords = homePageKeywords[lang as keyof typeof homePageKeywords] || homePageKeywords.en;

  return generatePageMetadata({
    title,
    description,
    keywords,
    lang
  });
}

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  
  return <HomePageServer dictionary={dictionary} language={lang as Locale} />;
}
