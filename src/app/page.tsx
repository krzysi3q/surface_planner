import { HomePageServer } from '@/components/HomePageServer';
import { getDictionary } from '@/dictionaries';
import { getLanguageFromHeaders } from '@/lib/language';
import { LanguagePersistence } from '@/components/LanguagePersistence';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguageFromHeaders();
  const dictionary = await getDictionary(lang);
  const baseUrl = 'https://handylay.com';
  
  // Use dictionary translations for better consistency
  const title = dictionary.app?.title || "HandyLay - Surface Planner";
  const description = dictionary.home?.hero?.description || "Create and design your perfect apartment floor or wall with interactive walls and tile layouts.";
  
  // Fallback metadata for languages that might not have all translations
  const fallbackTitles = {
    en: "HandyLay - Surface Planner",
    pl: "HandyLay - Planowanie Powierzchni", 
    es: "HandyLay - Planificador de Superficies",
    zh: "HandyLay - 表面规划师"
  };
  
  const fallbackDescriptions = {
    en: "Create and design your perfect apartment floor or wall with interactive walls and tile layouts.",
    pl: "Twórz i projektuj idealną podłogę lub ścianę swojego mieszkania z interaktywnymi ścianami i układami płytek.",
    es: "Crea y diseña el suelo o pared perfecta de tu apartamento con paredes interactivas y diseños de azulejos.", 
    zh: "为您的公寓地板或墙面创造和设计完美的布局，配备交互式墙面和瓷砖布局。"
  };

  const keywords = {
    en: "floor planner, surface planner, interior design, apartment design, wall design, tile layout, room planner",
    pl: "planowanie podłóg, projektowanie powierzchni, projektowanie wnętrz, projektowanie mieszkań, układanie płytek",
    es: "planificador de pisos, diseño de superficies, diseño de interiores, diseño de apartamentos, diseño de azulejos",
    zh: "地板规划, 表面设计, 室内设计, 公寓设计, 墙面设计, 瓷砖布局"
  };

  const finalTitle = title || fallbackTitles[lang] || fallbackTitles.en;
  const finalDescription = description || fallbackDescriptions[lang] || fallbackDescriptions.en;
  const keyword = keywords[lang] || keywords.en;
  
  // Create alternate language links
  const languages: Record<string, string> = {
    'en': `${baseUrl}/en`,
    'pl': `${baseUrl}/pl`,
    'es': `${baseUrl}/es`,
    'zh': `${baseUrl}/zh`,
    'x-default': `${baseUrl}/en`
  };

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: keyword,
    applicationName: "HandyLay",
    authors: [{ name: "HandyLay Team" }],
    creator: "HandyLay",
    publisher: "HandyLay",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: baseUrl,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: lang,
      url: baseUrl,
      title: finalTitle,
      description: finalDescription,
      siteName: 'HandyLay',
      images: [
        {
          url: `${baseUrl}/app-icon.png`,
          width: 512,
          height: 512,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [`${baseUrl}/app-icon.png`],
      creator: '@handylay',
    },
    other: {
      "mobile-web-app-title": "HandyLay",
      "mobile-web-app-capable": "yes",
      "mobile-web-app-status-bar-style": "default",
    }
  };
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