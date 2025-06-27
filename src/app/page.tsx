import Link from 'next/link';
import Image from 'next/image';
import { ScrollToButton } from "./components/ScrollToButton";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 text-slate-800 p-8 relative">
        <div className="text-center max-w-4xl">
          {/* App Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg p-2 flex items-center justify-center">
              <Image src={"/app-icon.png"} alt="App Icon" width={64} height={64} className="w-16 h-16" />
            </div>
          </div>
          
          <h1 className="text-6xl leading-18 font-bold mb-6 bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text text-transparent">
            Handy Lay
          </h1>
          <p className="text-2xl mb-8 text-slate-700 leading-relaxed">
            Your friendly tile and panel layout planner
          </p>
          <p className="text-lg mb-10 text-slate-600 max-w-2xl mx-auto">
            Plan the perfect tile layout for your walls and floors! Avoid tiny pieces at edges and minimize cuts - making your DIY project look professional and save you money.
          </p>
          <Link 
            href="/planner" 
            className="inline-block px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Planning Now
          </Link>
        </div>
        
        {/* Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollToButton 
            targetId="features-section"
            className="flex flex-col items-center text-slate-700 hover:text-orange-600 transition-colors duration-300 group cursor-pointer"
            aria-label="Scroll to features section"
          >
            <span className="text-sm mb-2 opacity-70 group-hover:opacity-100 transition-opacity">Learn more</span>
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
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-700">Why Choose Handy Lay?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">Smart Layout</h3>
              <p className="text-gray-600">
                Get the best tile arrangement automatically - no more guessing! Our tool figures out the perfect layout to minimize waste and maximize beauty.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">Visual Preview</h3>
              <p className="text-gray-600">
                See exactly how your tiles will look before you start cutting. No more surprises - just confidence in your project!
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">Save Money</h3>
              <p className="text-gray-600">
                Reduce waste and buy just what you need. Our calculations help you avoid overbuying tiles and materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-700">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
              <h3 className="font-semibold mb-2 text-slate-700">Measure Your Space</h3>
              <p className="text-gray-600 text-sm">Enter the dimensions of your wall or floor</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
              <h3 className="font-semibold mb-2 text-slate-700">Choose Your Tiles</h3>
              <p className="text-gray-600 text-sm">Input the size of your tiles or panels</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
              <h3 className="font-semibold mb-2 text-slate-700">Get Your Plan</h3>
              <p className="text-gray-600 text-sm">We&apos;ll create the perfect layout for you</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">4</div>
              <h3 className="font-semibold mb-2 text-slate-700">Start Tiling!</h3>
              <p className="text-gray-600 text-sm">Follow the plan and enjoy the results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-slate-700 to-slate-600 text-white">
        <div className="container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Perfect for DIY Enthusiasts</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Save Money</h3>
                    <p className="text-gray-300">Reduce material waste by up to 15% and avoid buying extra tiles &quot;just in case&quot;</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Look Like a Pro</h3>
                    <p className="text-gray-300">Get professional-looking results without the professional price tag</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Gain Confidence</h3>
                    <p className="text-gray-300">Start your project knowing exactly what to do and how much material you need</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6 text-orange-300">Great for:</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">First-time tilers</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">Weekend warriors</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">Home renovation projects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">Bathroom & kitchen makeovers</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-600">Professional contractors too!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-50">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-700">Ready to Get Started?</h2>
          <p className="text-xl mb-10 text-gray-600 max-w-2xl mx-auto">
            Join thousands of DIY enthusiasts and professionals who are already creating beautiful, waste-free tile layouts with Handy Lay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/planner" 
              className="px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Planning Now
            </Link>
            {/* <button className="px-8 py-4 border-2 border-orange-600 text-orange-600 font-bold text-lg rounded-lg hover:bg-orange-600 hover:text-white transition-all duration-300">
              See Demo
            </button> */}
          </div>
        </div>
      </section>

      <footer className="py-8 bg-slate-800 text-center text-gray-400">
        <div className="container mx-auto px-8">
          <p className="mb-4">© 2025 Handy Lay. All rights reserved.</p>
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
