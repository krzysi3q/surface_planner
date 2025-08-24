import { HomePageServer } from '@/components/HomePageServer';
import { getDictionary, type Locale } from '@/dictionaries';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  
  return <HomePageServer dictionary={dictionary} language={lang as Locale} />;
}
