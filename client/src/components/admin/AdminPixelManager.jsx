import React, { useState, useEffect } from 'react';
import { 
  Target, ShieldCheck, CheckCircle2, AlertCircle, Save, 
  Sparkles, ExternalLink, Code, Activity, RefreshCw 
} from 'lucide-react';
import { api } from '../../api';
import { pixelTracker } from '../../utils/pixelTracker';

export default function AdminPixelManager() {
  const [settings, setSettings] = useState({
    pixel_meta_id: '',
    pixel_tiktok_id: '',
    pixel_google_tag_id: '',
    custom_header_scripts: '',
    custom_body_scripts: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getSettings()
      .then(res => {
        const s = res.settings || {};
        setSettings({
          pixel_meta_id: s.pixel_meta_id || '',
          pixel_tiktok_id: s.pixel_tiktok_id || '',
          pixel_google_tag_id: s.pixel_google_tag_id || '',
          custom_header_scripts: s.custom_header_scripts || '',
          custom_body_scripts: s.custom_body_scripts || ''
        });
      })
      .catch(err => setStatusMessage({ text: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: '', type: '' });

    try {
      await api.updateSettings(settings);
      setStatusMessage({ text: 'পিক্সেল ও ট্র্যাকিং সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', type: 'success' });
      // Re-init pixels
      pixelTracker.settings = { ...pixelTracker.settings, ...settings };
      pixelTracker.injectPixels();
    } catch (err) {
      setStatusMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRunTestEvent = (eventName) => {
    if (eventName === 'PageView') {
      pixelTracker.trackPageView('Admin Pixel Test');
      setTestResult('✅ PageView ইভেন্ট সফলভাবে ফায়ার করা হয়েছে (Meta/TikTok/GA4 এ সেন্ড হয়েছে)');
    } else if (eventName === 'ViewContent') {
      pixelTracker.trackViewContent({ id: 999, title: 'টেস্ট প্রোডাক্ট', price: 1500 });
      setTestResult('✅ ViewContent ইভেন্ট ফায়ার করা হয়েছে (Value: ৳1500, Currency: BDT)');
    } else if (eventName === 'AddToCart') {
      pixelTracker.trackAddToCart({ id: 999, title: 'টেস্ট প্রোডাক্ট', unit_price: 1500, quantity: 1 });
      setTestResult('✅ AddToCart ইভেন্ট ফায়ার করা হয়েছে (Value: ৳1500)');
    } else if (eventName === 'Purchase') {
      pixelTracker.trackPurchase({ order_number: 'TEST-ORDER-1234', total_amount: 1560, delivery_fee: 60 });
      setTestResult('✅ Purchase ইভেন্ট ফায়ার করা হয়েছে (Order: TEST-ORDER-1234, Value: ৳1560)');
    }

    setTimeout(() => setTestResult(''), 4000);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">পিক্সেল সেটিংস লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300 mb-1">
            <Target className="w-4 h-4" />
            <span>Conversion API & Ad Pixels</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">মার্কেটিং পিক্সেল ও ট্র্যাকিং সেটআপ</h2>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Meta (Facebook) Pixel, TikTok Pixel, Google Analytics 4 এবং কাস্টম ট্র্যাকিং স্ক্রিপ্ট যুক্ত করুন। প্রতিটি প্রোডাক্ট ভিউ, অ্যাড টু কার্ট এবং ক্যাশ অন ডেলিভারি পারচেজ অটোমেটিক ট্র্যাক হবে।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
            settings.pixel_meta_id ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${settings.pixel_meta_id ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span>{settings.pixel_meta_id ? 'Meta Pixel Active' : 'Meta Pixel Inactive'}</span>
          </span>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage({ text: '', type: '' })} className="text-xs font-black">✕</button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        
        {/* Meta / Facebook Pixel */}
        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm">
                f
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Meta (Facebook) Pixel ID</h3>
                <p className="text-[11px] text-slate-500">Events Manager থেকে আপনার ১৬ ডিজিটের Pixel ID দিন</p>
              </div>
            </div>
            {settings.pixel_meta_id && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                সংযুক্ত
              </span>
            )}
          </div>

          <input
            type="text"
            value={settings.pixel_meta_id}
            onChange={(e) => setSettings({ ...settings, pixel_meta_id: e.target.value.trim() })}
            placeholder="যেমন: 1234567890123456"
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:border-blue-600 focus:outline-none transition"
          />
        </div>

        {/* TikTok Pixel */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                TikTok
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">TikTok Pixel ID</h3>
                <p className="text-[11px] text-slate-500">TikTok Ads Manager থেকে Pixel Code ID দিন</p>
              </div>
            </div>
            {settings.pixel_tiktok_id && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                সংযুক্ত
              </span>
            )}
          </div>

          <input
            type="text"
            value={settings.pixel_tiktok_id}
            onChange={(e) => setSettings({ ...settings, pixel_tiktok_id: e.target.value.trim() })}
            placeholder="যেমন: CXXXXXXXXXXXXXXXX"
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:border-slate-800 focus:outline-none transition"
          />
        </div>

        {/* Google Analytics 4 / Google Tag */}
        <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                G
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Google Analytics 4 (GA4) / Tag ID</h3>
                <p className="text-[11px] text-slate-500">Measurement ID (যেমন: G-XXXXXXXXXX)</p>
              </div>
            </div>
            {settings.pixel_google_tag_id && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                সংযুক্ত
              </span>
            )}
          </div>

          <input
            type="text"
            value={settings.pixel_google_tag_id}
            onChange={(e) => setSettings({ ...settings, pixel_google_tag_id: e.target.value.trim() })}
            placeholder="যেমন: G-XXXXXXXXXX"
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:border-amber-600 focus:outline-none transition"
          />
        </div>

        {/* Custom Header Scripts */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-slate-500" />
            <span>Custom Header Scripts (&lt;head&gt; ট্যাগে যুক্ত হবে)</span>
          </label>
          <textarea
            rows="3"
            value={settings.custom_header_scripts}
            onChange={(e) => setSettings({ ...settings, custom_header_scripts: e.target.value })}
            placeholder="<!-- Clarity, Hotjar, বা কাস্টম মেটা ট্যাগ এখানে পেস্ট করুন -->"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
          ></textarea>
        </div>

        {/* Custom Body Scripts */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-slate-500" />
            <span>Custom Body Scripts (&lt;body&gt; এর শেষে যুক্ত হবে)</span>
          </label>
          <textarea
            rows="3"
            value={settings.custom_body_scripts}
            onChange={(e) => setSettings({ ...settings, custom_body_scripts: e.target.value })}
            placeholder="<!-- লাইভ চ্যাট উইজেট স্ক্রিপ্ট ইত্যাদি -->"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
          ></textarea>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পিক্সেল সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>

      </form>

      {/* Live Event Test Runner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>লাইভ পিক্সেল ইভেন্ট টেস্ট করুন</span>
            </h3>
            <p className="text-xs text-slate-500">
              বাটনগুলোতে ক্লিক করে আপনার Facebook Pixel Helper এক্সটেনশনে টেস্ট ইভেন্টগুলো ভেরিফাই করুন।
            </p>
          </div>
        </div>

        {testResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
            {testResult}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => handleRunTestEvent('PageView')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition text-center"
          >
            Test PageView
          </button>
          <button
            type="button"
            onClick={() => handleRunTestEvent('ViewContent')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition text-center"
          >
            Test ViewContent
          </button>
          <button
            type="button"
            onClick={() => handleRunTestEvent('AddToCart')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition text-center"
          >
            Test AddToCart
          </button>
          <button
            type="button"
            onClick={() => handleRunTestEvent('Purchase')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 transition text-center"
          >
            Test Purchase (৳1560)
          </button>
        </div>
      </div>

    </div>
  );
}
