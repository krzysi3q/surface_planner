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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
