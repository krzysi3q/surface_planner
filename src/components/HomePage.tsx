'use client';

import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollToButton } from "@/app/[lang]/components/ScrollToButton";
import { SmartPlannerLink } from "@/components/SmartPlannerLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const HomePage = () => {
  const { t } = useTranslation();
  
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 text-slate-800 p-8 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
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
          <SmartPlannerLink 
            href="/planner" 
            className="inline-block px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('home.hero.cta')}
          </SmartPlannerLink>
        </div>
        
        {/* Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollToButton 
            targetId="features-section"
            className="flex flex-col items-center text-slate-700 hover:text-orange-600 transition-colors duration-300 group cursor-pointer"
            aria-label={t('home.hero.scrollToFeatures')}
          >
            <span className="text-sm mb-2 group-hover:scale-110 transition-transform duration-300">
              {t('home.hero.scroll')}
            </span>
            <div className="animate-bounce">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </ScrollToButton>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">
            {t('home.features.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">
                {t('home.features.interactive.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('home.features.interactive.description')}
              </p>
            </div>
            
            <div className="text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">
                {t('home.features.textures.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('home.features.textures.description')}
              </p>
            </div>
            
            <div className="text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">
                {t('home.features.fast.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('home.features.fast.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">
            {t('home.howItWorks.title')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="flex items-center space-x-8">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">
                    {t('home.howItWorks.step1.title')}
                  </h3>
                  <p className="text-slate-600">
                    {t('home.howItWorks.step1.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">
                    {t('home.howItWorks.step2.title')}
                  </h3>
                  <p className="text-slate-600">
                    {t('home.howItWorks.step2.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">
                    {t('home.howItWorks.step3.title')}
                  </h3>
                  <p className="text-slate-600">
                    {t('home.howItWorks.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('home.cta.description')}
          </p>
          <SmartPlannerLink 
            href="/planner" 
            className="inline-block px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-lg shadow-lg hover:bg-orange-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('home.cta.button')}
          </SmartPlannerLink>
        </div>
      </section>
    </>
  );
};
