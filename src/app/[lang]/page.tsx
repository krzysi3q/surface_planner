'use client';

import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollToButton } from "./components/ScrollToButton";
import { SmartPlannerLink } from "@/components/SmartPlannerLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
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
            <span className="text-sm mb-2 opacity-70 group-hover:opacity-100 transition-opacity">{t('home.hero.learnMore')}</span>
            <div className="animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </ScrollToButton>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-700">{t('home.features.title')}</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('home.features.smartLayout.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.smartLayout.description')}
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('home.features.visualPreview.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.visualPreview.description')}
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('home.features.saveMoney.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.saveMoney.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-700">{t('home.howItWorks.title')}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
              <h3 className="font-semibold mb-2 text-slate-700">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.howItWorks.step1.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
              <h3 className="font-semibold mb-2 text-slate-700">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.howItWorks.step2.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
              <h3 className="font-semibold mb-2 text-slate-700">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.howItWorks.step3.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">4</div>
              <h3 className="font-semibold mb-2 text-slate-700">{t('home.howItWorks.step4.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.howItWorks.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-slate-700 to-slate-600 text-white">
        <div className="container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">{t('home.benefits.title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('home.benefits.saveMoneyTitle')}</h3>
                    <p className="text-gray-300">{t('home.benefits.saveMoneyDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('home.benefits.lookProTitle')}</h3>
                    <p className="text-gray-300">{t('home.benefits.lookProDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('home.benefits.gainConfidenceTitle')}</h3>
                    <p className="text-gray-300">{t('home.benefits.gainConfidenceDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6 text-orange-300">{t('home.benefits.greatFor')}</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">{t('home.benefits.targets.firstTimers')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">{t('home.benefits.targets.weekendWarriors')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">{t('home.benefits.targets.homeRenovation')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">{t('home.benefits.targets.bathroomKitchen')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">{t('home.benefits.targets.professionals')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-50">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-700">{t('home.cta.title')}</h2>
          <p className="text-xl mb-10 text-gray-600 max-w-2xl mx-auto">
            {t('home.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SmartPlannerLink 
              href="/planner" 
              className="px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('home.cta.button')}
            </SmartPlannerLink>
            {/* <button className="px-8 py-4 border-2 border-orange-600 text-orange-600 font-bold text-lg rounded-lg hover:bg-orange-600 hover:text-white transition-all duration-300">
              See Demo
            </button> */}
          </div>
        </div>
      </section>

      <footer className="py-8 bg-slate-800 text-center text-gray-400">
        <div className="container mx-auto px-8">
          <p className="mb-4">{t('home.footer.copyright')}</p>
          {/* <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-orange-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition">Terms</a>
            <a href="#" className="hover:text-orange-400 transition">Contact</a>
          </div> */}
        </div>
      </footer>
    </>
  );
}
