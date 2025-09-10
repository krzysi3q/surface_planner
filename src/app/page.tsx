import { HomePageServer } from '@/components/HomePageServer';
import { getDictionary } from '@/dictionaries';
import { getLanguageFromHeaders } from '@/lib/language';
import { LanguagePersistence } from '@/components/LanguagePersistence';
import type { Metadata } from 'next';
import { 
  generatePageMetadata, 
  homePageTitles, 
  homePageDescriptions, 
  homePageKeywords 
} from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguageFromHeaders();
  const dictionary = await getDictionary(lang);
  
  // Use dictionary translations for better consistency, fallback to predefined
  const dictionaryTitle = dictionary.app?.title;
  const dictionaryDescription = dictionary.home?.hero?.description;
  
  const title = dictionaryTitle || homePageTitles[lang] || homePageTitles.en;
  const description = dictionaryDescription || homePageDescriptions[lang] || homePageDescriptions.en;
  const keywords = homePageKeywords[lang] || homePageKeywords.en;

  return generatePageMetadata({
    title,
    description,
    keywords,
    lang
  });
}

export default async function RootPage() {
  const language = await getLanguageFromHeaders();
  const dictionary = await getDictionary(language);
  
  return (
    <>
      <LanguagePersistence language={language} />
      <HomePageServer dictionary={dictionary} language={language} />
    </>
  );
}