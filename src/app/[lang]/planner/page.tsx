import type { Metadata } from 'next';
import { 
  generatePageMetadata, 
  plannerPageTitles, 
  plannerPageDescriptions, 
  homePageKeywords 
} from '@/lib/metadata';
import PlannerClient from './PlannerPageClient';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const title = plannerPageTitles[lang as keyof typeof plannerPageTitles] || plannerPageTitles.en;
  const description = plannerPageDescriptions[lang as keyof typeof plannerPageDescriptions] || plannerPageDescriptions.en;
  const keywords = homePageKeywords[lang as keyof typeof homePageKeywords] || homePageKeywords.en;

  return generatePageMetadata({
    title,
    description,
    keywords,
    path: '/planner',
    lang
  });
}

export default async function PlannerPage({ params }: PageProps) {
    const { lang } = await params;
  return <PlannerClient lang={lang} />;
}
