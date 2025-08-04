import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = 'https://handylay.com';
  
  const titles = {
    en: "Surface Planner - Design Your Space | HandyLay",
    pl: "Planowanie Powierzchni - Zaprojektuj Swoją Przestrzeń | HandyLay",
    es: "Planificador de Superficies - Diseña Tu Espacio | HandyLay",
    zh: "表面规划师 - 设计您的空间 | HandyLay"
  };
  
  const descriptions = {
    en: "Interactive surface planner tool. Design apartment floors and walls with precise measurements, tile patterns, and real-time visualization.",
    pl: "Interaktywne narzędzie do planowania powierzchni. Projektuj podłogi i ściany mieszkań z precyzyjnymi wymiarami i wzorami płytek.",
    es: "Herramienta interactiva de planificación de superficies. Diseña pisos y paredes de apartamentos con medidas precisas y patrones de azulejos.",
    zh: "交互式表面规划工具。设计公寓地板和墙面，具有精确测量、瓷砖图案和实时可视化功能。"
  };

  const title = titles[lang as keyof typeof titles] || titles.en;
  const description = descriptions[lang as keyof typeof descriptions] || descriptions.en;
  
  const languages: Record<string, string> = {
    'en': `${baseUrl}/en/planner`,
    'pl': `${baseUrl}/pl/planner`,
    'es': `${baseUrl}/es/planner`,
    'zh': `${baseUrl}/zh/planner`,
    'x-default': `${baseUrl}/en/planner`
  };

  return {
    title,
    description,
    keywords: "surface planner, floor design, wall design, tile calculator, room planner, interior design tool",
    alternates: {
      canonical: `${baseUrl}/${lang}/planner`,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: lang,
      url: `${baseUrl}/${lang}/planner`,
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
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
