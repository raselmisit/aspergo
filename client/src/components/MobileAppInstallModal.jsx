import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Download, X, CheckCircle2, Zap, ShieldCheck, 
  Share2, PlusSquare, ArrowRight, Sparkles 
} from 'lucide-react';

export default function MobileAppInstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      document.referrer.includes('android-app://');
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction
      alert("আপনার ব্রাউজারের থ্রি-ডট (⋮) মেন্যুতে ক্লিক করে 'Install App' বা 'Add to Home screen' চাপুন।");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#C8102E] via-[#990000] to-[#660000] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center">
            <img src="/logo.png" alt="ASPER GO" className="max-h-full max-w-full object-contain" />
          </div>

          <h3 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <Smartphone className="w-5 h-5 text-amber-300" />
            ASPER GO মোবাইল অ্যাপ
          </h3>
          <p className="text-xs text-white/90 mt-1 font-medium">
            ANYTHING, ANYTIME, ANYWHERE — সরাসরি আপনার ফোনে
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 bg-red-50/60 rounded-xl border border-red-100/60 text-slate-800">
              <Zap className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
              <span className="font-semibold">১-ক্লিক সুপারফাস্ট অর্ডার</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/60 text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold">ফ্ল্যাশ সেল নোটিফিকেশন</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">অফলাইনেও চলবে</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100/60 text-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-semibold">ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>

          {/* Action 1: Install App Button (PWA) */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-800">অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে!</p>
              <p className="text-xs text-emerald-600">হোম স্ক্রিনের ASPER GO আইকন থেকে সরাসরি ওপেন করুন।</p>
            </div>
          ) : isIOS ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-600" /> আইফোনে ইনস্টল করার নিয়ম:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>সাফারি ব্রাউজারের নিচে <b>Share</b> আইকন চাপুন</li>
                <li>নিচে স্ক্রোল করে <b>'Add to Home Screen'</b> চাপুন</li>
                <li>উপরে ডানে <b>'Add'</b> ক্লিক করুন</li>
              </ol>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#C8102E] to-[#990000] hover:from-[#A00D24] hover:to-[#800000] text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>সরাসরি অ্যাপ ইনস্টল করুন (Instant Install)</span>
            </button>
          )}

          {/* Action 2: Android Native APK info & GitHub Build */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                অ্যান্ড্রয়েড নেটিভ APK (Standalone App)
              </span>
              <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Capacitor Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              সিস্টেমটিতে সম্পূর্ণ <b>Capacitor Android Native Project</b> তৈরি করা আছে। GitHub-এ কোড পুশ করলেই <b>GitHub Actions</b> থেকে অটোমেটিক সরাসরি <b>.apk</b> ফাইল ডাউনলোড করা যাবে।
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 text-center"
          >
            পরে করবো (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
