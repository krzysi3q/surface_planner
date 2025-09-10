import type { Viewport } from "next";

type Props = {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children }: Props) {
  return children
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'pl' }, { lang: 'es' }, { lang: 'zh' }];
}
