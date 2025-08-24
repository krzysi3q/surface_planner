import Image from 'next/image';
import { getServerTranslation } from '@/dictionaries';
import { ScrollToButton } from "@/app/[lang]/components/ScrollToButton";
import { SimpleServerLink } from "@/components/SimpleServerLink";
import { ClientLanguageWrapper } from "@/components/ClientLanguageWrapper";
import { ArrowBigDown } from 'lucide-react'
import type { Locale } from '@/dictionaries';

interface HomePageServerProps {
  dictionary: Record<string, unknown>;
  language?: Locale;
}

export const HomePageServer = ({ dictionary, language = 'en' }: HomePageServerProps) => {
  const t = getServerTranslation(dictionary);
  
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 text-slate-800 p-8 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <ClientLanguageWrapper language={language} />
        </div>
        
        <div className="text-center max-w-4xl">
          {/* App Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg p-2 flex items-center justify-center">
              <Image src={"/app-icon.png"} alt={t('app.icon')} width={64} height={64} className="w-16 h-16" />
            </div>
          </div>
          
          <h1 className="text-6xl leading-18 font-bold mb-6 bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text text-transparent">
            {t('home.hero.title')}
          </h1>
          <p className="text-2xl mb-8 text-slate-700 leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          <p className="text-lg mb-10 text-slate-600 max-w-2xl mx-auto">
            {t('home.hero.description')}
          </p>
          <SimpleServerLink 
            href="/planner" 
            language={language}
            className="inline-block px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('home.hero.cta')}
          </SimpleServerLink>
        </div>
        
        {/* Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollToButton 
            targetId="features-section"
            className="flex flex-col items-center text-slate-700 hover:text-orange-600 transition-colors duration-300 group cursor-pointer"
          >
            <span className="text-sm mb-2 group-hover:text-orange-600 transition-colors">
              {t('home.hero.scroll')}
            </span>
            <ArrowBigDown className="animate-bounce size-6" />
          </ScrollToButton>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">
            {t('home.features.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Interactive Design */}
            <div className="text-center p-6 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a4 4 0 004 4h4V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.features.interactive.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.features.interactive.description')}
              </p>
            </div>

            {/* Rich Texture Library */}
            <div className="text-center p-6 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.features.textures.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.features.textures.description')}
              </p>
            </div>

            {/* Lightning Fast */}
            <div className="text-center p-6 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.features.fast.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.features.fast.description')}
              </p>
            </div>

            {/* Smart Layout */}
            <div className="text-center p-6 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.features.smartLayout.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.features.smartLayout.description')}
              </p>
            </div>

            {/* Visual Preview */}
            <div className="text-center p-6 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.features.visualPreview.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.features.visualPreview.description')}
              </p>
            </div>

            {/* Save Money */}
            <div className="text-center p-6 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.features.saveMoney.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.features.saveMoney.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">
            {t('home.howItWorks.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.howItWorks.step1.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.howItWorks.step2.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                {t('home.howItWorks.step3.title')}
              </h3>
              <p className="text-slate-600">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('home.cta.description')}
          </p>
          <SimpleServerLink 
            href="/planner" 
            language={language}
            className="inline-block px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('home.cta.button')}
          </SimpleServerLink>
        </div>
      </section>
    </>
  );
};
