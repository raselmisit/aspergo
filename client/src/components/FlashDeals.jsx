import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function FlashDeals({ products, onProductClick, onQuickView }) {
  // Flash deals countdown timer (Ends in e.g., 23 hours 45 mins)
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 35
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter(p => p.is_flash_deal === 1 || (p.discount_price && p.discount_price < p.price)).slice(0, 4);

  if (flashProducts.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Flash Deal Header Box */}
      <div className="bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#1A1A1A] rounded-2xl p-4 sm:p-6 shadow-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
        
        {/* Title & Badge */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
            <Flame className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                ASPER GO Flash Deals
              </h2>
              <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Up to 60% OFF
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-100 mt-0.5">
              Limited time hot offers. Grab your favorite essentials before stock runs out!
            </p>
          </div>
        </div>

        {/* Countdown Timer Units */}
        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
          <Clock className="w-4 h-4 text-amber-300 mr-1" />
          <span className="text-xs font-bold text-gray-200 uppercase mr-1">Ends In:</span>
          
          <div className="flex items-center space-x-1.5 font-mono text-sm font-black">
            <div className="bg-white text-[#C8102E] px-2 py-1 rounded-md shadow">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span>:</span>
            <div className="bg-white text-[#C8102E] px-2 py-1 rounded-md shadow">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span>:</span>
            <div className="bg-white text-[#C8102E] px-2 py-1 rounded-md shadow animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Flash Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {flashProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </div>
  );
}
