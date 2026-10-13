import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ExternalLink, Copy, Check, 
  Share2, Sparkles, Smartphone, Eye, Video, Image, 
  Flame, Clock, Star, MessageSquare, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { api, formatImageUrl } from '../../api';

export default function AdminLandingManager({ products = [], onOpenLandingPage }) {
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Social Post Generator States
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [selectedForSocial, setSelectedForSocial] = useState(null);
  const [generatedPost, setGeneratedPost] = useState('');
  const [copiedPost, setCopiedPost] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    product_id: '',
    title: '',
    slug: '',
    headline: '',
    subheadline: '',
    video_url: '',
    banner_image: '',
    discount_badge: '৫০% মেগা ডিসকাউন্ট',
    urgent_timer_minutes: 30,
    theme_color: '#C8102E',
    status: 'active',
    features: [
      '১০০% প্রিমিয়াম অরিজিনাল কোয়ালিটি',
      'সারা বাংলাদেশে ২৪-৪৮ ঘণ্টায় ক্যাশ অন ডেলিভারি',
      'পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের সুবিধা',
      '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি'
    ],
    reviews: [
      { name: 'তানভীর আহমেদ', location: 'উত্তরা, ঢাকা', rating: 5, comment: 'অসাধারণ কোয়ালিটি ও দ্রুত ডেলিভারি পেয়েছি।' },
      { name: 'সাদিয়া আক্তার', location: 'চট্টগ্রাম', rating: 5, comment: 'ছবিতে যেমন দেখেছি বাস্তবে একদম তেমনটাই পেয়েছি।' }
    ]
  });

  const loadLandingPages = () => {
    setLoading(true);
    api.getLandingPages()
      .then(res => setLandingPages(res.pages || []))
      .catch(err => setStatusMessage({ text: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLandingPages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPage(null);
    const defaultProd = products[0] || {};
    setFormData({
      product_id: defaultProd.id || '',
      title: defaultProd.title ? `${defaultProd.title} - স্পেশাল অফার` : 'নতুন ল্যান্ডিং পেজ',
      slug: defaultProd.slug ? `${defaultProd.slug}-offer` : `offer-${Date.now()}`,
      headline: 'সীমিত সময়ের জন্য বিশেষ ৫০% পর্যন্ত ছাড় ও ফ্রি ডেলিভারি অফার!',
      subheadline: 'হাতে পেয়ে চেক করে সম্পূর্ণ ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধের ১০০% গ্যারান্টি। আজই অর্ডার কনফার্ম করুন।',
      video_url: defaultProd.video_url || '',
      banner_image: defaultProd.image || '',
      discount_badge: '৫০% মেগা ডিসকাউন্ট',
      urgent_timer_minutes: 30,
      theme_color: '#C8102E',
      status: 'active',
      features: [
        '১০০% প্রিমিয়াম অরিজিনাল কোয়ালিটি',
        'সারা বাংলাদেশে ২৪-৪৮ ঘণ্টায় ক্যাশ অন ডেলিভারি',
        'পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের সুবিধা',
        '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি'
      ],
      reviews: [
        { name: 'তানভীর আহমেদ', location: 'উত্তরা, ঢাকা', rating: 5, comment: 'অসাধারণ কোয়ালিটি ও দ্রুত ডেলিভারি পেয়েছি।' },
        { name: 'সাদিয়া আক্তার', location: 'চট্টগ্রাম', rating: 5, comment: 'ছবিতে যেমন দেখেছি বাস্তবে একদম তেমনটাই পেয়েছি।' }
      ]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (page) => {
    setEditingPage(page);
    let feats = [];
    try {
      feats = typeof page.features === 'string' ? JSON.parse(page.features) : page.features;
      if (!Array.isArray(feats)) feats = [];
    } catch (e) {
      feats = [];
    }

    let revs = [];
    try {
      revs = typeof page.reviews === 'string' ? JSON.parse(page.reviews) : page.reviews;
      if (!Array.isArray(revs)) revs = [];
    } catch (e) {
      revs = [];
    }

    setFormData({
      product_id: page.product_id || '',
      title: page.title || '',
      slug: page.slug || '',
      headline: page.headline || '',
      subheadline: page.subheadline || '',
      video_url: page.video_url || '',
      banner_image: page.banner_image || '',
      discount_badge: page.discount_badge || '',
      urgent_timer_minutes: page.urgent_timer_minutes || 30,
      theme_color: page.theme_color || '#C8102E',
      status: page.status || 'active',
      features: feats.length ? feats : ['১০০% প্রিমিয়াম অরিজিনাল কোয়ালিটি'],
      reviews: revs.length ? revs : [{ name: 'কাস্টমার', location: 'ঢাকা', rating: 5, comment: 'খুব ভালো প্রোডাক্ট।' }]
    });
    setModalOpen(true);
  };

  const handleProductSelect = (productId) => {
    const prod = products.find(p => String(p.id) === String(productId));
    if (prod) {
      setFormData(prev => ({
        ...prev,
        product_id: prod.id,
        title: `${prod.title} - স্পেশাল অফার`,
        slug: `${prod.slug}-offer`,
        banner_image: prod.image,
        video_url: prod.video_url || prev.video_url
      }));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await api.updateLandingPage(editingPage.id, formData);
        setStatusMessage({ text: 'ল্যান্ডিং পেজ সফলভাবে আপডেট করা হয়েছে!', type: 'success' });
      } else {
        await api.createLandingPage(formData);
        setStatusMessage({ text: 'নতুন ল্যান্ডিং পেজ সফলভাবে তৈরি হয়েছে!', type: 'success' });
      }
      setModalOpen(false);
      loadLandingPages();
    } catch (err) {
      setStatusMessage({ text: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ল্যান্ডিং পেজটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteLandingPage(id);
      setStatusMessage({ text: 'ল্যান্ডিং পেজ মুছে ফেলা হয়েছে।', type: 'success' });
      loadLandingPages();
    } catch (err) {
      setStatusMessage({ text: err.message, type: 'error' });
    }
  };

  const copyLandingLink = (slug) => {
    const fullUrl = `${window.location.origin}/#landing/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Social Post Generator Trigger
  const handleOpenSocial = (page) => {
    setSelectedForSocial(page);
    const landingUrl = `${window.location.origin}/#landing/${page.slug}`;
    const priceText = page.discount_price ? `৳${page.discount_price} (পূর্বে ছিল ৳${page.price})` : `৳${page.price || 1200}`;
    
    const template = `🔥 সীমিত সময়ের মেগা অফার: ${page.title}!
⚡ ${page.headline}

✅ ১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি
✅ ডেলিভারি ম্যানের সামনে চেক করে মূল্য পরিশোধ (Cash on Delivery)
✅ সারা বাংলাদেশে ২৪-৪৮ ঘণ্টায় সুপারফাস্ট হোম ডেলিভারি
✅ ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি

💰 বিশেষ অফার মূল্য: ${priceText}
🎁 আজই অর্ডার করলে ফ্রি ডেলিভারি অফার!

👉 সরাসরি ১-ক্লিক অর্ডার করতে নিচের লিংকে ক্লিক করুন:
🛒 ${landingUrl}

📞 যেকোনো তথ্যের জন্য সরাসরি কল করুন: +880 1700-000000
#AsperGo #${page.slug.replace(/[^a-zA-Z0-9]/g, '')} #OnlineShoppingBD #CashOnDelivery`;

    setGeneratedPost(template);
    setSocialModalOpen(true);
  };

  const handleAIGeneratePost = async () => {
    if (!selectedForSocial) return;
    setGeneratingAI(true);
    try {
      const res = await api.runAIAgent({
        mode: 'ad_creator',
        context: {
          productName: selectedForSocial.title,
          price: selectedForSocial.discount_price || selectedForSocial.price || 1500
        }
      });

      if (res.result?.primaryText) {
        const landingUrl = `${window.location.origin}/#landing/${selectedForSocial.slug}`;
        const enhanced = res.result.primaryText.replace('https://aspergo.onrender.com', landingUrl);
        setGeneratedPost(enhanced);
      }
    } catch (e) {
      console.warn('AI generator fallback:', e);
    } finally {
      setGeneratingAI(false);
    }
  };

  const copySocialPost = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-900 via-[#C8102E] to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>High-Converting Sales Funnels</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ল্যান্ডিং পেজ ও সোশ্যাল মিডিয়া পোস্টিং</h2>
          <p className="text-xs text-white/90 mt-1 max-w-xl">
            যেকোনো প্রোডাক্টের জন্য হাই-কনভার্টিং ল্যান্ডিং পেজ তৈরি করুন এবং ফেসবুক/টিকটকের জন্য ১-ক্লিকে আকর্ষণীয় অ্যাড কপি জেনারেট করে সরাসরি পোস্ট করুন।
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-white text-[#C8102E] hover:bg-amber-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>নতুন ল্যান্ডিং পেজ তৈরি করুন</span>
        </button>
      </div>

      {statusMessage.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage({ text: '', type: '' })} className="text-xs font-black">✕</button>
        </div>
      )}

      {/* Landing Pages Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <span>সক্রিয় ল্যান্ডিং পেজ সমূহ ({landingPages.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">ল্যান্ডিং পেজ লোড হচ্ছে...</div>
        ) : landingPages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">কোনো ল্যান্ডিং পেজ তৈরি করা হয়নি</p>
            <p className="text-xs text-slate-400">আপনার বেস্ট সেলিং প্রোডাক্টের জন্য প্রথম ল্যান্ডিং পেজটি এখনই তৈরি করুন।</p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 bg-[#C8102E] text-white text-xs font-bold rounded-xl"
            >
              তৈরি করুন
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {landingPages.map((lp) => {
              const fullUrl = `${window.location.origin}/#landing/${lp.slug}`;
              return (
                <div key={lp.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="flex items-start gap-4">
                    <img
                      src={formatImageUrl(lp.banner_image || lp.product_image)}
                      alt={lp.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{lp.title}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                          lp.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {lp.status}
                        </span>
                        {lp.discount_badge && (
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            {lp.discount_badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{lp.headline}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>ভিউ: <b>{lp.views || 0}</b></span>
                        <span>•</span>
                        <span className="font-mono text-red-600">/#landing/{lp.slug}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                    {/* View Page */}
                    <button
                      onClick={() => onOpenLandingPage(lp.slug)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>লাইভ দেখুন</span>
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={() => copyLandingLink(lp.slug)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      {copiedSlug === lp.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>লিংক কপি</span>
                        </>
                      )}
                    </button>

                    {/* Social Post Generator */}
                    <button
                      onClick={() => handleOpenSocial(lp)}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>সোশ্যাল পোস্ট তৈরি</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(lp)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                      title="এডিট"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(lp.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Landing Page */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-[#C8102E] to-red-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">
                  {editingPage ? 'ল্যান্ডিং পেজ সম্পাদনা করুন' : 'নতুন সেলস ল্যান্ডিং পেজ তৈরি'}
                </h3>
                <p className="text-xs text-white/80">পণ্য সিলেক্ট করলেই ছবি ও বিবরণ অটোমেটিক বসে যাবে</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white font-black text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Product Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">পণ্য নির্বাচন করুন (Product) *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                >
                  <option value="">-- পণ্য বেছে নিন --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} (মূল্য: ৳{p.discount_price || p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেজ শিরোনাম (Internal Title) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="যেমন: T900 Ultra Smartwatch Special Offer"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug (লিংক পাথ) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="যেমন: smartwatch-offer"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-red-600"
                  />
                </div>
              </div>

              {/* Main Headline */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">আকর্ষণীয় প্রধান হেডলাইন (Main Headline) *</label>
                <input
                  type="text"
                  required
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="যেমন: সীমিত সময়ের জন্য বিশেষ ৫০% পর্যন্ত ছাড় ও ফ্রি ডেলিভারি অফার!"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              {/* Subheadline */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">সাব-হেডলাইন (Sub-Headline)</label>
                <textarea
                  rows="2"
                  value={formData.subheadline}
                  onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                  placeholder="যেমন: হাতে পেয়ে চেক করে সম্পূর্ণ ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধের ১০০% গ্যারান্টি..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Banner Image URL */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ব্যানার / প্রোডাক্ট ছবি URL</label>
                  <input
                    type="text"
                    value={formData.banner_image}
                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                    placeholder="https://... বা /uploads/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ভিডিও লিংক (YouTube বা সরাসরি MP4)</label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="যেমন: https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Discount Badge */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডিসকাউন্ট ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={formData.discount_badge}
                    onChange={(e) => setFormData({ ...formData, discount_badge: e.target.value })}
                    placeholder="যেমন: ৫০% মেগা ডিসকাউন্ট"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Urgent Timer */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কাউন্টডাউন টাইমার (মিনিট)</label>
                  <input
                    type="number"
                    value={formData.urgent_timer_minutes}
                    onChange={(e) => setFormData({ ...formData, urgent_timer_minutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingPage ? 'সংরক্ষণ করুন' : 'ল্যান্ডিং পেজ প্রকাশ করুন'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Social Media Post Generator */}
      {socialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  সোশ্যাল মিডিয়া অ্যাড ও পোস্ট জেনারেটর
                </h3>
                <p className="text-xs text-white/80">ফেসবুক, টিকটক ও হোয়াটসঅ্যাপে এক ক্লিকে শেয়ার করার উপযোগী</p>
              </div>
              <button onClick={() => setSocialModalOpen(false)} className="text-white/80 hover:text-white font-black text-sm">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">পোস্টের বিষয়বস্তু (Post Caption):</span>
                <button
                  onClick={handleAIGeneratePost}
                  disabled={generatingAI}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs hover:opacity-95 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generatingAI ? 'AI তৈরি করছে...' : 'AI দিয়ে অ্যাড কপি রি-রাইট করুন'}</span>
                </button>
              </div>

              <textarea
                rows="9"
                value={generatedPost}
                onChange={(e) => setGeneratedPost(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-sans leading-relaxed focus:bg-white focus:outline-none"
              ></textarea>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  onClick={copySocialPost}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  {copiedPost ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPost ? 'কপি হয়েছে!' : 'ক্যাপশন কপি করুন'}</span>
                </button>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/#landing/${selectedForSocial?.slug}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>ফেসবুকে শেয়ার</span>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generatedPost)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-[#25D366] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে পাঠান</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
