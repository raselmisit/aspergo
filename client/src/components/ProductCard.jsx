import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Eye, CheckCircle2, Star, Flame, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onClick }) {
  const { addToCart, buyNowDirect } = useCart();

  // Fluctuate live viewing count slightly around product.live_views_base to give a true real-time feel
  const [liveViewers, setLiveViewers] = useState(() => {
    return (product.live_views_base || 140) + Math.floor(Math.random() * 15 - 7);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 7) - 3;
      setLiveViewers(prev => Math.max(12, prev + delta));
    }, 6000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const discountPercent = product.discount_price && product.price > product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const effectivePrice = Number(product.discount_price || product.price || 0);
  const regularPrice = Number(product.price || 0);
  const savings = regularPrice > effectivePrice ? regularPrice - effectivePrice : 0;

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-2xl hover:border-red-200/80 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Discount / Flash Deal Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md tracking-wider uppercase border border-white/20">
            -{discountPercent}% OFF
          </span>
        )}
        {product.is_flash_deal === 1 && (
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
            <Flame className="w-3 h-3 fill-slate-950 text-slate-950" /> FLASH DEAL
          </span>
        )}
      </div>

      {/* Stock warning if low */}
      {product.stock <= 5 && product.stock > 0 && (
        <span className="absolute top-3 right-3 z-10 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
          Only {product.stock} Left!
        </span>
      )}

      {/* Product Image Thumbnail */}
      <div 
        onClick={() => onClick(product)}
        className="relative pt-[90%] bg-slate-50/80 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Quick View Overlay Bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 text-white">
          <Eye className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs font-bold tracking-wide">Quick View Details (বিস্তারিত দেখুন)</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category */}
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 truncate">
            {product.category_name || 'ASPER GO Verified'}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onClick(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#C8102E] transition-colors line-clamp-2 leading-snug cursor-pointer min-h-[38px]"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Social Proof Badges (Live Viewing & Delivered Counter) */}
          <div className="mt-2.5 space-y-1.5">
            {/* Live View Counter */}
            <div className="flex items-center text-[10px] sm:text-[11px] font-bold text-amber-900 bg-amber-50/90 px-2.5 py-1 rounded-lg w-fit border border-amber-200/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-1.5"></span>
              <span><strong>{liveViewers}</strong> people viewing right now</span>
            </div>

            {/* Delivery Counter */}
            <div className="flex items-center text-[10px] sm:text-[11px] font-bold text-emerald-900 bg-emerald-50/90 px-2.5 py-1 rounded-lg w-fit border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0" />
              <span><strong>{product.units_delivered_base || 120}+</strong> units delivered</span>
            </div>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center space-x-1.5 mt-2.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-black text-slate-800">{product.rating || 4.9}</span>
            <span className="text-[11px] text-slate-400 font-medium">({product.total_reviews || 42} reviews)</span>
          </div>
        </div>

        {/* Pricing & Action Buttons */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-baseline justify-between gap-1 mb-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg sm:text-2xl font-black text-[#C8102E] tracking-tight">
                ৳{effectivePrice.toLocaleString()}
              </span>
              {product.discount_price && (
                <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                  ৳{regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            {savings > 0 && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Save ৳{savings.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quick Action Buttons: Buy Now (1-click) & Add to Cart */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product, 1, true)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-97"
              title="Add product to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
              <span>Add Cart</span>
            </button>

            <button
              onClick={() => buyNowDirect(product, 1)}
              className="w-full bg-asper-gradient hover-asper-gradient text-white py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-md hover:shadow-red-900/30 transition cursor-pointer active:scale-97"
              title="1-Click Direct Fast Buy"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

