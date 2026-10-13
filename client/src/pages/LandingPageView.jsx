import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Truck, Clock, Flame, Star, CheckCircle2, 
  ArrowDown, Play, Phone, MapPin, User, FileText, 
  Sparkles, Check, ChevronRight, AlertCircle, ShoppingBag
} from 'lucide-react';
import { api, formatImageUrl } from '../api';
import { pixelTracker } from '../utils/pixelTracker';

export default function LandingPageView({ slug, onOrderSuccess, onBackToStore }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Urgency Timer State
  const [timeLeft, setTimeLeft] = useState({ minutes: 28, seconds: 45 });

  // 1-Click Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setCustomerAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Load active delivery zones
  useEffect(() => {
    api.getDeliveryZones()
      .then(res => {
        const zones = res.zones || [];
        setDeliveryZones(zones);
        if (zones.length > 0) {
          setSelectedZone(zones[0]);
          setDistrict(zones[0].name);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getLandingPage(slug)
      .then(res => {
        setPage(res.page);
        if (res.page) {
          api.recordLandingPageView(res.page.id).catch(() => {});
          pixelTracker.trackPageView(`Landing: ${res.page.title}`);
          if (res.page.product_title) {
            pixelTracker.trackViewContent({
              id: res.page.product_id,
              title: res.page.product_title,
              price: res.page.price,
              discount_price: res.page.discount_price
            });
          }
          if (res.page.urgent_timer_minutes) {
            setTimeLeft({ minutes: res.page.urgent_timer_minutes, seconds: 0 });
          }
        }
      })
      .catch(err => {
        setError(err.message || 'ল্যান্ডিং পেজ লোড করতে সমস্যা হয়েছে');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 24, seconds: 59 }; // Reset loop for urgency
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-sm font-semibold tracking-wide">ল্যান্ডিং পেজ প্রস্তুত হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-800">ল্যান্ডিং পেজ পাওয়া যায়নি</h2>
          <p className="text-sm text-slate-500">{error || 'পেজটি স্থগিত বা মুছে ফেলা হয়েছে।'}</p>
          <button
            onClick={onBackToStore}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition"
          >
            মূল ওয়েবসাইটে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // Parse features and reviews
  let features = [];
  try {
    features = typeof page.features === 'string' ? JSON.parse(page.features) : page.features;
    if (!Array.isArray(features)) features = [];
  } catch (e) {
    features = [];
  }

  let reviews = [];
  try {
    reviews = typeof page.reviews === 'string' ? JSON.parse(page.reviews) : page.reviews;
    if (!Array.isArray(reviews)) reviews = [];
  } catch (e) {
    reviews = [];
  }

  const unitPrice = page.discount_price && page.discount_price > 0 ? page.discount_price : page.price;
  const deliveryFee = selectedZone 
    ? Number(selectedZone.charge) 
    : (district.toLowerCase() === 'dhaka' ? 60 : 120);
  const totalAmount = (unitPrice * quantity) + deliveryFee;

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    setDistrict(zone.name);
  };

  const scrollToCheckout = () => {
    const el = document.getElementById('landing-fast-checkout');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLandingCheckout = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setOrderError('দয়া করে আপনার নাম, মোবাইল নাম্বার এবং সম্পূর্ণ ঠিকানা দিন।');
      return;
    }

    setSubmittingOrder(true);
    setOrderError('');

    try {
      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_address: deliveryAddress.trim(),
        district: district,
        notes: `Landing Page: ${page.title}. ${notes ? `Note: ${notes}` : ''}`,
        payment_method: 'cod',
        delivery_fee: deliveryFee,
        items: [
          {
            product_id: page.product_id,
            product_title: page.product_title || page.title,
            product_image: page.banner_image || page.product_image,
            cost_price: page.cost_price || 0,
            unit_price: unitPrice,
            quantity: quantity,
            total_price: unitPrice * quantity
          }
        ]
      };

      const res = await api.createOrder(orderData);
      
      // Fire Purchase Event
      pixelTracker.trackPurchase({
        order_number: res.orderNumber,
        total_amount: totalAmount,
        delivery_fee: deliveryFee
      });

      if (onOrderSuccess) {
        onOrderSuccess(res.orderNumber);
      } else {
        alert(`ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অর্ডার আইডি: ${res.orderNumber}`);
        onBackToStore();
      }
    } catch (err) {
      setOrderError(err.message || 'অর্ডার প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 pb-20">
      
      {/* Top Floating Urgency Bar */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white py-2.5 px-4 shadow-xl border-b border-white/10 text-center flex items-center justify-center gap-2 text-xs sm:text-sm font-bold">
        <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>স্পেশাল অফার শেষ হতে আর মাত্র:</span>
        <div className="bg-slate-950/80 px-2.5 py-0.5 rounded-md font-mono text-amber-300 font-black text-sm tracking-wider">
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-8 sm:space-y-12">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onBackToStore}>
            <img src="/logo.png" alt="ASPER GO" className="h-9 w-auto object-contain" />
            <span className="font-black text-lg tracking-wider text-white">ASPER <span className="text-[#C8102E]">GO</span></span>
          </div>
          <button 
            onClick={onBackToStore}
            className="text-xs text-slate-400 hover:text-white transition underline"
          >
            ← মূল শপ দেখুন
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          {page.discount_badge && (
            <span className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              {page.discount_badge}
            </span>
          )}

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            {page.headline}
          </h1>

          {page.subheadline && (
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {page.subheadline}
            </p>
          )}

          {/* Pricing Highlight */}
          <div className="inline-flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-3 sm:p-4 rounded-2xl shadow-xl">
            <span className="text-xs sm:text-sm text-slate-400">অফার মূল্য:</span>
            <span className="text-2xl sm:text-4xl font-black text-amber-400">৳{unitPrice}</span>
            {page.price > unitPrice && (
              <span className="text-sm sm:text-lg text-slate-500 line-through">৳{page.price}</span>
            )}
          </div>
        </div>

        {/* Media: Video or Main Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-black aspect-video flex items-center justify-center">
          {page.video_url ? (
            page.video_url.includes('youtube.com') || page.video_url.includes('youtu.be') ? (
              <iframe
                src={page.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + '?autoplay=1'}
                title={page.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={formatImageUrl(page.video_url)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <img
              src={formatImageUrl(page.banner_image || page.product_image)}
              alt={page.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Primary CTA Button */}
        <div className="text-center">
          <button
            onClick={scrollToCheckout}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-lg sm:text-xl rounded-2xl shadow-2xl shadow-red-600/30 transform active:scale-98 transition flex items-center justify-center gap-3 mx-auto"
          >
            <span>সরাসরি অর্ডার করতে ক্লিক করুন</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
          <p className="text-xs text-slate-400 mt-2">
            🔒 ১০০% ক্যাশ অন ডেলিভারি — হাতে পণ্য পেয়ে দেখে টাকা দিবেন
          </p>
        </div>

        {/* Features / Why Buy From Us */}
        {features.length > 0 && (
          <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-amber-400 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              কেন এই পণ্যটি আপনার জন্য সেরা পছন্দ?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-1">
            <Truck className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">দ্রুত ডেলিভারি</h4>
            <p className="text-[11px] text-slate-400">২৪-৪৮ ঘণ্টায় হোম ডেলিভারি</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-1">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">ক্যাশ অন ডেলিভারি</h4>
            <p className="text-[11px] text-slate-400">পণ্য দেখে মূল্য পরিশোধ</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-1">
            <Clock className="w-6 h-6 text-blue-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">৭ দিনের ওয়ারেন্টি</h4>
            <p className="text-[11px] text-slate-400">সহজ রিপ্লেসমেন্ট পলিসি</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-1">
            <Phone className="w-6 h-6 text-purple-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">২৪/৭ সাপোর্ট</h4>
            <p className="text-[11px] text-slate-400">যেকোনো তথ্যে পাশে আছি</p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-center text-white flex items-center justify-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              সম্মানিত কাস্টমারদের মতামত
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{rev.name}</div>
                      <div className="text-[11px] text-slate-400">{rev.location}</div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Embedded 1-Click Fast Checkout Form */}
        <div id="landing-fast-checkout" className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-600/60 space-y-6">
          <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
            <span className="inline-block bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase">
              ১-ক্লিক ক্যাশ অন ডেলিভারি অর্ডার
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              অর্ডারটি কনফার্ম করতে নিচের ফর্মটি পূরণ করুন
            </h3>
            <p className="text-xs text-slate-500">
              কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই। ডেলিভারি ম্যানের সামনে দেখে মূল্য পরিশোধ করবেন।
            </p>
          </div>

          {orderError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
              {orderError}
            </div>
          )}

          <form onSubmit={handleLandingCheckout} className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800">অর্ডার পরিমাণ (Quantity):</span>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 transition"
                >
                  -
                </button>
                <span className="font-black text-base text-slate-900 w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                আপনার নাম *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: মোঃ কামরুল হাসান"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-red-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                মোবাইল নাম্বার * (১১ ডিজিট)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="যেমন: 01712345678"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-red-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Delivery District Radio */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                ডেলিভারি এরিয়া বেছে নিন *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {deliveryZones.length > 0 ? (
                  deliveryZones.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id || district === zone.name;
                    return (
                      <div
                        key={zone.id}
                        onClick={() => handleSelectZone(zone)}
                        className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition ${
                          isSelected ? 'border-red-600 bg-red-50/70 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-left">
                          <input
                            type="radio"
                            name="delivery_zone"
                            checked={isSelected}
                            onChange={() => handleSelectZone(zone)}
                            className="text-red-600"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block leading-tight">{zone.name}</span>
                            {zone.estimated_time && (
                              <span className="text-[10px] text-slate-500 block">{zone.estimated_time}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-black text-red-600 ml-2 whitespace-nowrap">৳{zone.charge}</span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition ${
                      district === 'Dhaka' ? 'border-red-600 bg-red-50/50' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="district"
                          checked={district === 'Dhaka'}
                          onChange={() => setDistrict('Dhaka')}
                          className="text-red-600"
                        />
                        <span className="text-xs font-bold text-slate-800">ঢাকা সিটির ভিতরে</span>
                      </div>
                      <span className="text-xs font-black text-red-600">৳৬০</span>
                    </label>

                    <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition ${
                      district === 'Outside Dhaka' ? 'border-red-600 bg-red-50/50' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="district"
                          checked={district === 'Outside Dhaka'}
                          onChange={() => setDistrict('Outside Dhaka')}
                          className="text-red-600"
                        />
                        <span className="text-xs font-bold text-slate-800">ঢাকার বাহিরে</span>
                      </div>
                      <span className="text-xs font-black text-red-600">৳১২০</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Full Delivery Address */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                সম্পূর্ণ ডেলিভারি ঠিকানা * (বাসা/রোড/এলাকা/থানা)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows="2"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="যেমন: বাসা নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-red-600 focus:outline-none transition"
                ></textarea>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>পণ্য মূল্য:</span>
                <span className="font-bold">৳{unitPrice} x {quantity} = ৳{unitPrice * quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-red-600">৳{deliveryFee}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>সর্বমোট পরিশোধযোগ্য (ক্যাশ অন ডেলিভারি):</span>
                <span className="text-red-600 text-base">৳{totalAmount}</span>
              </div>
            </div>

            {/* Confirm Order Button */}
            <button
              type="submit"
              disabled={submittingOrder}
              className="w-full py-4 bg-gradient-to-r from-[#C8102E] via-red-700 to-amber-600 hover:opacity-95 text-white font-black text-lg rounded-2xl shadow-xl shadow-red-600/30 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {submittingOrder ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-amber-300" />
                  <span>অর্ডার কনফার্ম করুন (৳{totalAmount})</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
