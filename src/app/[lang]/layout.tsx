import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { I18nProvider } from '@/components/I18nProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const titles = {
    en: "HandyLay - Surface Planner",
    pl: "HandyLay - Planowanie Powierzchni"
  };
  
  const descriptions = {
    en: "Create and design your perfect apartment floor or wall with interactive walls and tile layouts.",
    pl: "Twórz i projektuj idealną podłogę lub ścianę swojego mieszkania z interaktywnymi ścianami i układami płytek."
  };

  return {
    title: titles[lang as keyof typeof titles] || titles.en,
    description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
    applicationName: "HandyLay",
    other: {
      "apple-mobile-web-app-title": "HandyLay",
    }
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider initialLanguage={lang}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'pl' }];
}
