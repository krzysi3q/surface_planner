import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLanguageFromHeaders } from '@/lib/language';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
