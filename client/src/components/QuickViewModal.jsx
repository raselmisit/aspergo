import React, { useState } from 'react';
import { 
  X, ShoppingBag, Zap, Star, CheckCircle2, ShieldCheck, 
  Truck, Eye, ArrowRight, Heart 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatImageUrl } from '../api';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { addToCart, buyNowDirect } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [selectedColor, setSelectedColor] = useState('Default');

  if (!isOpen || !product) return null;

  const effectivePrice = Number(product.discount_price || product.price || 0);
  const regularPrice = Number(product.price || 0);
  const savings = regularPrice > effectivePrice ? regularPrice - effectivePrice : 0;
  const discountPercent = regularPrice > effectivePrice
    ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
    : 0;

  // Adaptive dummy sizes and colors for demonstration
  const availableSizes = ['M', 'L', 'XL', 'Standard'];
  const availableColors = [
    { name: 'Classic Black', hex: '#111827' },
    { name: 'Crimson Red', hex: '#C8102E' },
    { name: 'Pearl White', hex: '#E5E7EB' }
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity, true);
    onClose();
  };

  const handleBuyNow = () => {
    buyNowDirect(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#C8102E] p-2 rounded-full transition shadow-xs cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 sm:p-7">
          {/* Product Image */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center">
              {discountPercent > 0 && (
                <span className="absolute top-2.5 left-2.5 bg-[#C8102E] text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
              <img
                src={formatImageUrl(product.image)}
                alt={product.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details & Selection */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            <div>
              {/* Category Breadcrumb */}
              <div className="text-[11px] font-extrabold text-[#C8102E] uppercase tracking-wider">
                {product.category_name || 'ASPER GO Verified'}
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 leading-snug">
                {product.title}
              </h3>

              {/* Rating & Social Proof */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-emerald-700 text-white text-xs font-black px-1.5 py-0.5 rounded">
                  <span>{product.rating || 4.9}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </div>
                <span className="text-xs text-slate-400 font-medium">({product.total_reviews || 42} reviews)</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-emerald-700 font-bold">
                  {product.units_delivered_base || 120}+ Sold
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 pt-3">
                <span className="text-2xl font-black text-[#C8102E] tracking-tight">
                  ৳{effectivePrice.toLocaleString()}
                </span>
                {regularPrice > effectivePrice && (
                  <span className="text-sm text-slate-400 line-through font-semibold">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                )}
                {savings > 0 && (
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    সেভ ৳{savings.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Select Size Option */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>সাইজ নির্বাচন (Size):</span>
                  <span className="text-slate-400 font-normal text-[11px]">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        selectedSize === s
                          ? 'border-[#C8102E] bg-red-50 text-[#C8102E] shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Color Option */}
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>কালার ভ্যারিয়েন্ট (Color):</span>
                  <span className="text-slate-400 font-normal text-[11px]">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 pt-3">
                <span className="text-xs font-bold text-slate-700">পরিমাণ (Qty):</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold transition text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-black text-slate-900 border-x border-slate-100">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold transition text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-97"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
                  <span>কার্টে যোগ করুন</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-asper-gradient hover-asper-gradient text-white py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-md hover:shadow-red-900/30 transition cursor-pointer active:scale-97"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>অর্ডার করুন (Buy Now)</span>
                </button>
              </div>

              {/* Security Pill */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>২৪-৪৮ ঘণ্টায় হোম ডেলিভারি | ১০০% ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
