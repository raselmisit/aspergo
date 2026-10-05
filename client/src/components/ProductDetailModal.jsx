import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Zap, Star, ShieldCheck, Truck, 
  RefreshCw, Eye, CheckCircle2, Flame, Heart, Share2, Plus, Minus,
  Play, Video, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart, buyNowDirect } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [liveViewers, setLiveViewers] = useState(product?.live_views_base || 350);

  // Gallery & Video parsing
  let galleryArray = [];
  if (product?.gallery) {
    try {
      galleryArray = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
      if (!Array.isArray(galleryArray)) galleryArray = [];
    } catch (e) {
      galleryArray = [];
    }
  }

  // Combine primary image + gallery
  const allImages = [
    product?.image,
    ...galleryArray.filter(img => img && img !== product?.image)
  ].filter(Boolean);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveMediaIndex(0);
    setShowVideo(false);
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 9) - 4;
      setLiveViewers(prev => Math.max(25, prev + delta));
    }, 5000);
    return () => clearInterval(interval);
  }, [product]);

  if (!product) return null;

  const currentImage = allImages[activeMediaIndex] || product.image;

  const discountPercent = product.discount_price && product.price > product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          
          {/* Left: Product Media (Images Gallery & Video Player) */}
          <div className="md:col-span-6 flex flex-col items-center">
            
            {/* Main Media Container */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-950 border border-gray-100 shadow-inner aspect-square flex items-center justify-center">
              
              {showVideo && product.video_url ? (
                // Video Player Mode
                <div className="w-full h-full bg-black flex items-center justify-center">
                  {product.video_url.includes('youtube.com') || product.video_url.includes('youtu.be') ? (
                    <iframe
                      src={product.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + '?autoplay=1'}
                      title={product.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={product.video_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                // Image View Mode
                <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                  <img
                    src={currentImage}
                    alt={product.title}
                    className="w-full h-full object-cover transition duration-300"
                  />

                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <span className="absolute top-3 left-3 bg-asper-gradient text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg">
                      -{discountPercent}% OFF
                    </span>
                  )}

                  {/* Photo Counter Badge */}
                  {allImages.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      📷 {activeMediaIndex + 1} / {allImages.length}
                    </span>
                  )}

                  {/* Previous / Next Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (All Images + Video Tab) */}
            <div className="w-full mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              
              {/* Image Thumbnails */}
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowVideo(false);
                    setActiveMediaIndex(idx);
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition cursor-pointer ${
                    !showVideo && activeMediaIndex === idx
                      ? 'border-[#C8102E] ring-2 ring-red-400/40 scale-105 shadow-md'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}

              {/* Video Player Thumbnail Button */}
              {product.video_url && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`h-14 px-3 rounded-xl flex-shrink-0 border-2 flex flex-col items-center justify-center transition cursor-pointer ${
                    showVideo
                      ? 'border-[#C8102E] bg-[#C8102E] text-white shadow-md'
                      : 'border-red-300 bg-red-50 text-[#C8102E] hover:bg-red-100'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current animate-pulse" />
                  <span className="text-[9px] font-black uppercase mt-0.5">Video</span>
                </button>
              )}
            </div>

            {/* Live Social Proof Badge below image */}
            <div className="w-full mt-4 bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-800 text-xs sm:text-sm font-bold">
                <Eye className="w-4 h-4 text-amber-600 animate-pulse flex-shrink-0" />
                <span><strong>{liveViewers}</strong> people viewing right now</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-800 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><strong>{product.units_delivered_base || 120}+</strong> delivered</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Fast Purchase */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#C8102E] bg-red-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {product.category_name || 'ASPER GO Verified'}
                </span>
                {product.subcategory_name && (
                  <span className="text-xs text-gray-500">/ {product.subcategory_name}</span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 leading-snug">
                {product.title}
              </h2>

              {/* Ratings */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">{product.rating || 4.9}</span>
                <span className="text-xs text-gray-400">({product.total_reviews || 42} Customer Reviews)</span>
              </div>

              {/* Dynamic Price Box (Updates in Real-Time with Quantity) */}
              {(() => {
                const unitEffectivePrice = Number(product.discount_price || product.price || 0);
                const unitRegularPrice = Number(product.price || 0);
                const totalEffectivePrice = unitEffectivePrice * quantity;
                const totalRegularPrice = unitRegularPrice * quantity;
                const totalSavings = (unitRegularPrice - unitEffectivePrice) * quantity;

                return (
                  <div className="flex flex-wrap items-baseline gap-3 mt-4 p-3.5 bg-red-50/70 rounded-2xl border border-red-100">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl sm:text-4xl font-black text-[#C8102E] tracking-tight">
                        ৳{totalEffectivePrice.toLocaleString()}
                      </span>
                      {quantity > 1 && (
                        <span className="text-xs text-gray-600 font-bold bg-white px-2 py-0.5 rounded-md border border-red-200/60 shadow-xs">
                          (৳{unitEffectivePrice.toLocaleString()} × {quantity})
                        </span>
                      )}
                    </div>

                    {product.discount_price && (
                      <span className="text-sm sm:text-base text-gray-400 line-through font-bold">
                        ৳{totalRegularPrice.toLocaleString()}
                      </span>
                    )}

                    {discountPercent > 0 && (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        You Save ৳{totalSavings.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Stock Status */}
              <div className="mt-3 flex items-center space-x-2 text-xs font-semibold">
                <span className="text-gray-600">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} items available)
                  </span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed max-h-36 overflow-y-auto">
                  {product.description || 'Premium quality guaranteed product with express nationwide delivery and 100% Cash on Delivery.'}
                </p>
              </div>

              {/* Quantity Selector with Real-time multiplier */}
              <div className="mt-4 flex items-center space-x-4 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700 uppercase">Quantity (পরিমাণ):</span>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-red-50 hover:text-[#C8102E] text-gray-700 transition cursor-pointer font-black text-base"
                    title="Decrease Quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-1 text-base font-black text-gray-900 min-w-[36px] text-center bg-gray-50/50">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 50, q + 1))}
                    className="p-2.5 hover:bg-red-50 hover:text-[#C8102E] text-gray-700 transition cursor-pointer font-black text-base"
                    title="Increase Quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-gray-500 font-semibold">
                  Total: <strong className="text-[#C8102E]">৳{((Number(product.discount_price || product.price || 0)) * quantity).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons: 1-Click Buy Now & Add to Cart */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  buyNowDirect(product, quantity);
                  onClose();
                }}
                className="w-full bg-asper-gradient hover-asper-gradient text-white py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center space-x-2 shadow-xl hover:shadow-red-900/40 transition cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>
                  BUY NOW - ৳{((Number(product.discount_price || product.price || 0)) * quantity).toLocaleString()} (১-ক্লিকে অর্ডার)
                </span>
              </button>

              <button
                onClick={() => {
                  addToCart(product, quantity, true);
                  onClose();
                }}
                className="w-full bg-gray-900 hover:bg-black text-white py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD {quantity} TO SHOPPING CART (৳{((Number(product.discount_price || product.price || 0)) * quantity).toLocaleString()})</span>
              </button>
            </div>

            {/* Delivery & Assurance Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
                <span>Inside Dhaka: ৳60 (24h)<br/>Outside: ৳120 (48h)</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Cash on Delivery<br/>Check parcel & pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
