import type { Metadata } from "next";

export interface MetadataConfig {
  title: string;
  description: string;
  keywords: string;
  path?: string;
  lang: string;
}

export function generatePageMetadata(config: MetadataConfig): Metadata {
  const { title, description, keywords, path = '', lang } = config;
  const baseUrl = 'https://handylay.app';
  
  // For root page, don't include language in URL
  const isRootPage = path === '';
  const fullUrl = isRootPage ? baseUrl : `${baseUrl}/${lang}${path}`;
  
  // Create alternate language links
  const languages: Record<string, string> = isRootPage ? {
    'en': `${baseUrl}/en`,
    'pl': `${baseUrl}/pl`,
    'es': `${baseUrl}/es`,
    'zh': `${baseUrl}/zh`,
    'x-default': baseUrl
  } : {
    'en': `${baseUrl}/en${path}`,
    'pl': `${baseUrl}/pl${path}`,
    'es': `${baseUrl}/es${path}`,
    'zh': `${baseUrl}/zh${path}`,
    'x-default': `${baseUrl}/en${path}`
  };

  return {
    title,
    description,
    keywords,
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
      canonical: fullUrl,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: lang,
      url: fullUrl,
      title,
      description,
      siteName: 'HandyLay',
      images: [
        {
          url: `${baseUrl}/app-icon.png`,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/app-icon.png`],
      creator: '@handylay',
    },
    other: {
      "apple-mobile-web-app-title": "HandyLay",
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
    }
  };
}

export const homePageTitles = {
  en: "HandyLay - Surface Planner",
  pl: "HandyLay - Planowanie Powierzchni",
  es: "HandyLay - Planificador de Superficies",
  zh: "HandyLay - 表面规划师"
};

export const homePageDescriptions = {
  en: "Create and design your perfect apartment floor or wall with interactive walls and tile layouts.",
  pl: "Twórz i projektuj idealną podłogę lub ścianę swojego mieszkania z interaktywnymi ścianami i układami płytek.",
  es: "Crea y diseña el suelo o pared perfecta de tu apartamento con paredes interactivas y diseños de azulejos.",
  zh: "为您的公寓地板或墙面创造和设计完美的布局，配备交互式墙面和瓷砖布局。"
};

export const homePageKeywords = {
  en: "floor planner, surface planner, interior design, apartment design, wall design, tile layout, room planner",
  pl: "planowanie podłóg, projektowanie powierzchni, projektowanie wnętrz, projektowanie mieszkań, układanie płytek",
  es: "planificador de pisos, diseño de superficies, diseño de interiores, diseño de apartamentos, diseño de azulejos",
  zh: "地板规划, 表面设计, 室内设计, 公寓设计, 墙面设计, 瓷砖布局"
};

export const plannerPageTitles = {
  en: "HandyLay Planner - Design Your Surface",
  pl: "HandyLay Planner - Projektuj Swoją Powierzchnię",
  es: "HandyLay Planner - Diseña Tu Superficie",
  zh: "HandyLay 规划器 - 设计您的表面"
};

export const plannerPageDescriptions = {
  en: "Interactive surface planner tool for designing apartment floors and walls with precise measurements and tile layouts.",
  pl: "Interaktywne narzędzie do planowania powierzchni do projektowania podłóg i ścian mieszkań z precyzyjnymi pomiarami i układami płytek.",
  es: "Herramienta de planificación de superficies interactiva para diseñar pisos y paredes de apartamentos con medidas precisas y diseños de azulejos.",
  zh: "交互式表面规划工具，用于设计公寓地板和墙面，具有精确测量和瓷砖布局功能。"
};

export const languagePageTitles = {
  en: "Choose Language - HandyLay",
  pl: "Wybierz Język - HandyLay",
  es: "Elegir Idioma - HandyLay",
  zh: "选择语言 - HandyLay"
};

export const languagePageDescriptions = {
  en: "Select your preferred language for the HandyLay surface planner application.",
  pl: "Wybierz preferowany język dla aplikacji planowania powierzchni HandyLay.",
  es: "Selecciona tu idioma preferido para la aplicación de planificación de superficies HandyLay.",
  zh: "为 HandyLay 表面规划应用程序选择您的首选语言。"
};
