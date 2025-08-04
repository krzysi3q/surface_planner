import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function getLanguageFromHeaders(): Promise<string> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  
  if (!acceptLanguage) return 'en';
  
  const locales = ['en', 'pl', 'es', 'zh'];
  const languages = acceptLanguage
    .split(',')
    .map((lang: string) => lang.split(';')[0].trim().toLowerCase());
  
  for (const lang of languages) {
    if (locales.includes(lang)) {
      return lang;
    }
    const langPrefix = lang.split('-')[0];
    if (locales.includes(langPrefix)) {
      return langPrefix;
    }
  }
  
  return 'en';
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguageFromHeaders();
  const baseUrl = 'https://handylay.com';
  
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

  const keywords = {
    en: "floor planner, surface planner, interior design, apartment design, wall design, tile layout, room planner",
    pl: "planowanie podłóg, projektowanie powierzchni, projektowanie wnętrz, projektowanie mieszkań, układanie płytek",
    es: "planificador de pisos, diseño de superficies, diseño de interiores, diseño de apartamentos, diseño de azulejos",
    zh: "地板规划, 表面设计, 室内设计, 公寓设计, 墙面设计, 瓷砖布局"
  };

  const title = titles[lang as keyof typeof titles] || titles.en;
  const description = descriptions[lang as keyof typeof descriptions] || descriptions.en;
  const keyword = keywords[lang as keyof typeof keywords] || keywords.en;
  
  // Create alternate language links
  const languages: Record<string, string> = {
    'en': `${baseUrl}/en`,
    'pl': `${baseUrl}/pl`,
    'es': `${baseUrl}/es`,
    'zh': `${baseUrl}/zh`,
    'x-default': `${baseUrl}/en`
  };

  return {
    title,
    description,
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
      "apple-mobile-web-app-capable": "yes",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLanguageFromHeaders();
  
  return (
    <html lang={lang}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Cloudflare Web Analytics */}
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "ccf773cb97ec4c48a9729b3105430263"}'></script>
        {/* End Cloudflare Web Analytics */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
