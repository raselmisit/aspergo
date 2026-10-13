import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, TrendingUp, Search, PenTool, 
  Copy, Check, Send, ChevronRight, Zap, Target, 
  DollarSign, ShieldCheck, Flame, Key, ExternalLink, RefreshCw 
} from 'lucide-react';
import { api } from '../../api';

export default function AdminAIAgentView({ products = [], onCreateLandingWithAd }) {
  const [activeSubMode, setActiveSubMode] = useState('marketing'); // 'marketing' | 'research' | 'ad_creator' | 'settings'
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [selectedSeason, setSelectedSeason] = useState('বর্তমান মৌসুম ও ট্রেন্ড');
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Research fields
  const [researchTitle, setResearchTitle] = useState('');
  const [researchPrice, setResearchPrice] = useState(1500);
  const [researchCost, setResearchCost] = useState(750);

  // Results State
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Settings State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState('');

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.settings?.ai_gemini_api_key) {
        setGeminiApiKey(res.settings.ai_gemini_api_key);
      }
    }).catch(() => {});
  }, []);

  const seasons = [
    'বর্তমান মৌসুম ও ট্রেন্ড (General Everyday)',
    'ঈদ-উল-ফিতর মেগা সেল (Eid-ul-Fitr)',
    'ঈদ-উল-আযহা মেগা অফার (Eid-ul-Adha)',
    'শীতকালীন কালেকশন ও ডিসকাউন্ট (Winter Sale)',
    'পহেলা বৈশাখ স্পেশাল (Boishakhi Mela)',
    'ব্যাক টু স্কুল ও ক্যাম্পাস গ্যাজেট (Back to Campus)',
    'ইয়ার-এন্ড ক্লিয়ারেন্স সেল (Year-End Clearance)'
  ];

  const handleRunAgent = async (overrideMode) => {
    const mode = overrideMode || activeSubMode;
    if (mode === 'settings') return;

    setLoading(true);
    setAiResult(null);

    const productObj = products.find(p => String(p.id) === String(selectedProduct)) || {};
    const title = researchTitle || productObj.title || 'স্মার্ট গ্যাজেট / ট্রেন্ডিং প্রোডাক্ট';
    const price = researchPrice || productObj.price || 1500;
    const cost = researchCost || productObj.cost_price || 750;

    try {
      const res = await api.runAIAgent({
        mode,
        prompt: customPrompt || `Generate comprehensive ${mode} strategy for ${title}`,
        context: {
          productName: title,
          price,
          costPrice: cost,
          season: selectedSeason
        }
      });
      setAiResult(res.result);
    } catch (err) {
      alert(err.message || 'AI রিকোয়েস্ট ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      await api.updateSettings({ ai_gemini_api_key: geminiApiKey.trim() });
      setKeySavedMessage('API Key সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setKeySavedMessage(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingKey(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-red-900 to-amber-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300 mb-1">
            <Bot className="w-4 h-4" />
            <span>Autonomous E-Commerce AI Brain</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ASPER GO - AI মার্কেটিং ও প্রোডাক্ট এজেন্ট</h2>
          <p className="text-xs text-white/90 mt-1 max-w-xl">
            মার্কেটিং প্ল্যানিং, লাভজনক প্রোডাক্ট রিসার্চ, ফেসবুক ও টিকটকের জন্য বিজ্ঞাপন কপি ও স্ক্রিপ্ট তৈরি — সবকিছু করবে আপনার সার্বক্ষণিক AI পার্টনার।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{geminiApiKey ? 'Gemini 1.5 Active' : 'Expert Built-in AI Active'}</span>
          </span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex flex-wrap gap-1">
        <button
          onClick={() => { setActiveSubMode('marketing'); setAiResult(null); }}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubMode === 'marketing'
              ? 'bg-[#C8102E] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>মার্কেটিং স্ট্র্যাটেজি</span>
        </button>

        <button
          onClick={() => { setActiveSubMode('research'); setAiResult(null); }}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubMode === 'research'
              ? 'bg-[#C8102E] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>প্রোডাক্ট ও মার্জিন রিসার্চ</span>
        </button>

        <button
          onClick={() => { setActiveSubMode('ad_creator'); setAiResult(null); }}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubMode === 'ad_creator'
              ? 'bg-[#C8102E] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>অ্যাড কপি ও ভিডিও স্ক্রিপ্ট</span>
        </button>

        <button
          onClick={() => { setActiveSubMode('settings'); setAiResult(null); }}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubMode === 'settings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>AI কনফিগ</span>
        </button>
      </div>

      {/* Main Workspace */}
      {activeSubMode !== 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C8102E]" />
                <span>ইনপুট ও প্যারামিটার নির্বাচন</span>
              </h3>

              {/* Mode 1 & 3: Product & Season Selection */}
              {activeSubMode !== 'research' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">পণ্য নির্বাচন করুন:</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} (৳{p.discount_price || p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">মৌসুম / ইভেন্ট নির্বাচন করুন:</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                    >
                      {seasons.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Mode 2: Research Specific Inputs */}
              {activeSubMode === 'research' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">প্রোডাক্টের নাম বা আইডিয়া:</label>
                    <input
                      type="text"
                      value={researchTitle}
                      onChange={(e) => setResearchTitle(e.target.value)}
                      placeholder="যেমন: Wireless 3-in-1 Fast Magnetic Car Mount"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">প্রস্তাবিত বিক্রয় মূল্য (৳):</label>
                      <input
                        type="number"
                        value={researchPrice}
                        onChange={(e) => setResearchPrice(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">সোর্সিং বা ক্রয় মূল্য (৳):</label>
                      <input
                        type="number"
                        value={researchCost}
                        onChange={(e) => setResearchCost(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Custom Prompt Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিশেষ কোনো নির্দেশ বা অনুরোধ (ঐচ্ছিক):
                </label>
                <textarea
                  rows="3"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="যেমন: তরুণদের আকৃষ্ট করার জন্য একটু মজার ভঙ্গিতে অ্যাড কপি লিখে দাও..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              {/* Run Button */}
              <button
                type="button"
                onClick={() => handleRunAgent()}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#C8102E] to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-500/20 active:scale-98 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI চিন্তা করছে ও তথ্য সাজাচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AI বিশ্লেষণ ও জেনারেশন শুরু করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Response Output Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 min-h-[440px] flex flex-col justify-between">
              
              {!aiResult && !loading && (
                <div className="my-auto text-center space-y-3 py-12">
                  <div className="w-16 h-16 bg-red-50 text-[#C8102E] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">AI এজেন্ট প্রস্তুত</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    বামদিকের অপশনগুলো নির্বাচন করে <b>"AI বিশ্লেষণ শুরু করুন"</b> বাটনে চাপ দিন। আপনার ব্যবসার উপযোগী তথ্য তাত্ক্ষণিক তৈরি হয়ে যাবে।
                  </p>
                </div>
              )}

              {loading && (
                <div className="my-auto text-center space-y-4 py-16">
                  <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-slate-600">বাজারের ট্রেন্ড ও উপাত্ত যাচাই করা হচ্ছে...</p>
                </div>
              )}

              {aiResult && !loading && (
                <div className="space-y-5 text-xs">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{aiResult.title || 'AI Generated Insights'}</h4>
                      <p className="text-[11px] text-slate-500">প্রোভাইডার: <b>{aiResult.provider}</b></p>
                    </div>
                  </div>

                  {/* Mode: Raw text (from Gemini) */}
                  {aiResult.raw && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 whitespace-pre-line leading-relaxed text-slate-800 text-xs">
                      {aiResult.raw}
                    </div>
                  )}

                  {/* Mode: Marketing Structured Sections */}
                  {aiResult.sections && (
                    <div className="space-y-4">
                      {aiResult.sections.map((sec, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                          <h5 className="font-black text-slate-900 text-xs">{sec.heading}</h5>
                          <ul className="space-y-1.5 list-disc list-inside text-slate-700 text-[11px] leading-relaxed">
                            {sec.points.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mode: Research Metrics & Insights */}
                  {aiResult.metrics && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">বিক্রয় মূল্য</div>
                          <div className="text-sm font-black text-slate-900">{aiResult.metrics.retailPrice}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">সোর্সিং খরচ</div>
                          <div className="text-sm font-black text-slate-900">{aiResult.metrics.costPrice}</div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                          <div className="text-[10px] text-emerald-600 font-bold uppercase">গ্রস লাভ</div>
                          <div className="text-sm font-black text-emerald-800">{aiResult.metrics.grossProfit}</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                          <div className="text-[10px] text-blue-600 font-bold uppercase">প্রত্যাশিত নেট লাভ</div>
                          <div className="text-sm font-black text-blue-800">{aiResult.metrics.estNetProfitPerOrder}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <h5 className="font-bold text-slate-900 text-xs">বিশ্লেষণ ও সুপারিশ:</h5>
                        <ul className="space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                          {aiResult.insights.map((ins, iIdx) => (
                            <li key={iIdx}>{ins}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Mode: Ad Creator Output */}
                  {aiResult.hooks && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                        <h5 className="font-black text-amber-900 text-xs">🎯 ৩টি পরীক্ষিত সাইকোলজিক্যাল হুক:</h5>
                        <div className="space-y-1.5 text-[11px] text-slate-800 font-medium">
                          {aiResult.hooks.map((h, hIdx) => (
                            <div key={hIdx} className="p-2 bg-white rounded-lg border border-amber-200/60">{h}</div>
                          ))}
                        </div>
                      </div>

                      {/* Primary Text */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <h5 className="font-black text-slate-900 text-xs">📄 ফেসবুক প্রাইমারি অ্যাড টেক্সট:</h5>
                          <button
                            onClick={() => copyText(aiResult.primaryText, 'primaryText')}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            {copiedKey === 'primaryText' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'primaryText' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                          </button>
                        </div>
                        <div className="whitespace-pre-line text-slate-800 text-[11px] bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-sans">
                          {aiResult.primaryText}
                        </div>
                      </div>

                      {/* Video Script */}
                      {aiResult.videoScript && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <h5 className="font-black text-slate-900 text-xs">🎬 ৩০-সেকেন্ডের টিকটক/রিলস ভিডিও স্ক্রিপ্ট:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {aiResult.videoScript.map((step, sIdx) => (
                              <div key={sIdx} className="p-2.5 bg-white rounded-xl border border-slate-200">
                                <span className="font-bold text-red-600 block">{step.time}:</span>
                                <span className="text-slate-700">{step.action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Bottom copy / clear */}
              {aiResult && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setAiResult(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        /* Settings Tab */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 max-w-xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Google Gemini API Key কনফিগারেশন</h3>
              <p className="text-xs text-slate-500">লাইভ জেমিনাই AI মডেল সক্রিয় করতে Google AI Studio থেকে ফ্রি কী দিন</p>
            </div>
          </div>

          {keySavedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
              {keySavedMessage}
            </div>
          )}

          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gemini API Key (AI Studio):
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ফাঁকা রাখলে সিস্টেমটির নিজস্ব শক্তিশালী <b>Built-in Expert E-commerce Engine</b> কাজ করবে।
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                <span>ফ্রি API Key তৈরি করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="submit"
                disabled={savingKey}
                className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                {savingKey ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
