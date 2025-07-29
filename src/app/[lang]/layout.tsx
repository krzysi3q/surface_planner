import type { Metadata, Viewport } from "next";
import { I18nProvider } from '@/components/I18nProvider';

type Props = {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const titles = {
    en: "HandyLay - Surface Planner",
    pl: "HandyLay - Planowanie Powierzchni",
    es: "HandyLay - Planificador de Superficies",
    zh: "HandyLay - 表面规划师"
  };
  
  const descriptions = {
    en: "Create and design your perfect apartment floor or wall with interactive walls and tile layouts.",
    pl: "Twórz i projektuj idealną podłogę lub ścianę swojego mieszkania z interaktywnymi ścianami i układami płytek.",
    es: "Crea y diseña el suelo o pared perfecta de tu apartamento con paredes interactivas y diseños de azulejos.",
    zh: "为您的公寓地板或墙面创造和设计完美的布局，配备交互式墙面和瓷砖布局。"
  };

  return {
    title: titles[lang as keyof typeof titles] || titles.en,
    description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
    applicationName: "HandyLay",
    other: {
      "apple-mobile-web-app-title": "HandyLay",
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  return (
    <I18nProvider initialLanguage={lang}>
      {children}
    </I18nProvider>
  );
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'pl' }, { lang: 'es' }, { lang: 'zh' }];
}
