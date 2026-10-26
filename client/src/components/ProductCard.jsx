import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Eye, Star, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatImageUrl } from '../api';

export default function ProductCard({ product, onClick, onQuickView }) {
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
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-red-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden relative">
      
      {/* Discount / Flash Deal Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-[#C8102E] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs tracking-tight uppercase leading-none">
            -{discountPercent}%
          </span>
        )}
        {product.is_flash_deal === 1 && (
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 leading-none">
            <Flame className="w-2.5 h-2.5 fill-slate-950 text-slate-950" /> FLASH
          </span>
        )}
      </div>

      {/* Stock warning if low */}
      {product.stock <= 5 && product.stock > 0 && (
        <span className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs leading-none">
          {product.stock} Left
        </span>
      )}

      {/* Product Image Thumbnail */}
      <div 
        onClick={() => onClick(product)}
        className="relative pt-[92%] bg-slate-50 overflow-hidden cursor-pointer"
      >
        <img
          src={formatImageUrl(product.image)}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-300 ease-out"
          loading="lazy"
          decoding="async"
        />

        {/* Quick View Floating Action Bar */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickView) onQuickView(product);
            else onClick(product);
          }}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 text-white hover:text-amber-300"
          title="কুইক ভিউ (Quick View)"
        >
          <Eye className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] font-extrabold tracking-wide">কুইক ভিউ (Quick View)</span>
        </div>
      </div>

      {/* Card Body (Ultra Compact Spacing - Option 2 Style) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1">
        <div className="space-y-1">
          {/* Category */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none truncate">
            {product.category_name || 'ASPER GO'}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onClick(product)}
            className="text-xs font-bold text-slate-800 group-hover:text-[#C8102E] transition-colors line-clamp-2 leading-tight cursor-pointer min-h-[30px]"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Slim Live Viewing & Delivered / Sold Counter (1 compact line) */}
          <div className="flex items-center justify-between text-[10px] leading-none pt-0.5">
            <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              {liveViewers} viewing
            </span>
            <span className="text-slate-500 font-semibold italic text-[10px]">
              {product.units_delivered_base || 120}+ sold
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] leading-none text-slate-500 pt-0.5">
            <div className="inline-flex items-center gap-0.5 bg-emerald-700 text-white px-1 py-0.5 rounded font-black text-[9px] leading-none">
              <span>{product.rating || 4.9}</span>
              <Star className="w-2 h-2 fill-current" />
            </div>
            <span className="text-slate-400 font-medium">({product.total_reviews || 38})</span>
          </div>
        </div>

        {/* Pricing & Quick Buttons */}
        <div className="pt-1 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-1 pb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-[#C8102E] leading-none tracking-tight">
                ৳{effectivePrice.toLocaleString()}
              </span>
              {product.discount_price && (
                <span className="text-[11px] text-slate-400 line-through font-semibold leading-none">
                  ৳{regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            {savings > 0 && (
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded leading-none">
                -৳{savings.toLocaleString()}
              </span>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              onClick={() => addToCart(product, 1, true)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer active:scale-97"
              title="Add product to cart"
            >
              <ShoppingBag className="w-3 h-3 text-slate-700" />
              <span>Add Cart</span>
            </button>

            <button
              onClick={() => buyNowDirect(product, 1)}
              className="w-full bg-asper-gradient hover-asper-gradient text-white py-1.5 px-1 rounded-lg text-[11px] font-black flex items-center justify-center space-x-1 shadow-xs hover:shadow-red-900/20 transition cursor-pointer active:scale-97"
              title="1-Click Direct Fast Buy"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
