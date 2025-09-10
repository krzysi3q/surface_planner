type Props = {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  return children
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'pl' }, { lang: 'es' }, { lang: 'zh' }];
}
