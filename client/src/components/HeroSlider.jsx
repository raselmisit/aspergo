import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';
import { api } from '../api';

export default function HeroSlider({ onExploreClick }) {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    api.getBanners()
      .then(res => {
        if (res.banners && res.banners.length > 0) {
          setBanners(res.banners);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const defaultBanners = [
    {
      title: 'ANYTHING, ANYTIME, ANYWHERE',
      subtitle: 'Mega Flash Sale: Up to 60% OFF on Top Trending Gadgets & Lifestyle Essentials',
      badge_text: 'PREMIUM BRAND PROMISE',
      button_text: 'SHOP NOW',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Fastest 24-48h Delivery in BD',
      subtitle: '100% Cash on Delivery & Hassle-free 1-Click Fast Checkout at your fingertip',
      badge_text: 'EXPRESS SHIPPING',
      button_text: 'EXPLORE OFFERS',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    }
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;
  const currentBanner = displayBanners[currentIndex] || displayBanners[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Hero Banner Container */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-asper-dark-gradient min-h-[360px] sm:min-h-[440px] flex items-center">
        
        {/* Background Overlay Graphic */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C8102E_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="grid grid-cols-1 md:grid-cols-12 items-center w-full z-10 p-6 sm:p-12 gap-8">
          
          {/* Left Text & CTA */}
          <div className="md:col-span-7 space-y-4 sm:space-y-6 text-white text-left">
            
            {/* Promotional Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg border border-red-400/40">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{currentBanner.badge_text || 'EXCLUSIVE DEAL'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase font-sans">
              <span className="text-white drop-shadow-md">
                {currentBanner.title}
              </span>
            </h1>

            {/* Tagline / Subtitle */}
            <p className="text-gray-200 text-sm sm:text-lg max-w-xl font-medium leading-relaxed drop-shadow">
              {currentBanner.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="bg-asper-gradient text-white px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center space-x-2 shadow-xl hover:scale-105 hover:shadow-red-900/50 transition cursor-pointer"
              >
                <span>{currentBanner.button_text || 'SHOP NOW'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center text-xs text-gray-300 font-semibold bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 mr-2 text-red-400" />
                <span>Cash on Delivery (হোম ডেলিভারি)</span>
              </div>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="md:col-span-5 flex justify-center items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000"></div>
              <img
                src={currentBanner.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                alt="ASPER GO Featured"
                className="relative rounded-2xl shadow-2xl object-cover w-72 h-56 sm:w-96 sm:h-72 border-2 border-white/20 transform group-hover:scale-102 transition duration-500"
              />
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        {displayBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {displayBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-8 bg-[#C8102E]' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trust & Value Pillars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-gray-900">24-48 Hours Delivery</div>
            <div className="text-[11px] text-gray-500">Fast nationwide courier</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-gray-900">100% Cash On Delivery</div>
            <div className="text-[11px] text-gray-500">Pay after check parcel</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-gray-900">7 Days Return</div>
            <div className="text-[11px] text-gray-500">Easy replacement guarantee</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-gray-900">100% Original Products</div>
            <div className="text-[11px] text-gray-500">Quality assured by ASPER GO</div>
          </div>
        </div>
      </div>
    </div>
  );
}
