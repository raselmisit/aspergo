import React from 'react';
import { Phone, Mail, MapPin, Truck, ShieldCheck, RefreshCw, Headphones, Award } from 'lucide-react';

export default function Footer({ onCategorySelect, onTrackClick }) {
  return (
    <footer className="bg-gradient-to-br from-[#1C0407] via-[#2B060C] to-[#100103] text-gray-300 pt-12 pb-8 border-t-4 border-amber-400 mt-auto shadow-2xl">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top Feature Highlights Bar with Gold & Crimson Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 mb-10 border-b border-amber-400/20 text-xs">
          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs sm:text-sm">100% Cash on Delivery</div>
              <div className="text-[11px] text-amber-200/70">হাতে পেয়ে চেক করে মূল্য দিন</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs sm:text-sm">100% Authentic Quality</div>
              <div className="text-[11px] text-amber-200/70">যাচাইকৃত সেরা ও টেকসই মান</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs sm:text-sm">Easy 7 Days Returns</div>
              <div className="text-[11px] text-amber-200/70">সহজ রিটার্ন ও রিপ্লেসমেন্ট</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs sm:text-sm">24/7 Dedicated Support</div>
              <div className="text-[11px] text-amber-200/70">সার্বক্ষণিক কাস্টমার কেয়ার</div>
            </div>
          </div>
        </div>

        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-amber-400/20">
          
          {/* Col 1 & 2: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white px-3.5 py-2 rounded-xl shadow-md inline-block">
                <img 
                  src="/logo.png" 
                  alt="ASPER GO" 
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/public/logo.png';
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              <strong className="text-white">ASPER GO</strong> is Bangladesh's modern e-commerce destination providing high-grade lifestyle essentials, smart electronics, trendy fashion, and daily groceries delivered right to your doorstep.
            </p>

            <div className="text-xs font-black tracking-widest text-amber-400 uppercase flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ANYTHING, ANYTIME, ANYWHERE</span>
            </div>

            {/* Helpline contact info */}
            <div className="space-y-2 pt-2 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Customer Helpline: <strong className="text-amber-300 font-bold">+880 1700-000000</strong> (9am - 10pm)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Official Email: <strong className="text-white">support@aspergo.com</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Head Office: Dhanmondi, Dhaka-1209, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider border-l-2 border-amber-400 pl-2.5">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={onTrackClick} className="hover:text-amber-300 transition cursor-pointer flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <span className="hover:text-amber-300 transition cursor-pointer flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Delivery & Shipping Info</span>
                </span>
              </li>
              <li>
                <span className="hover:text-amber-300 transition cursor-pointer flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>7-Day Return & Refund Policy</span>
                </span>
              </li>
              <li>
                <span className="hover:text-amber-300 transition cursor-pointer flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Terms of Service & Privacy</span>
                </span>
              </li>
              <li>
                <span className="hover:text-amber-300 transition cursor-pointer flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Frequently Asked Questions (FAQ)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider border-l-2 border-amber-400 pl-2.5">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onCategorySelect('electronics-gadgets')} className="hover:text-amber-300 transition text-left flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Smart Electronics & Gadgets</span>
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('asper-motors')} className="hover:text-amber-300 transition text-left flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>ASPER MOTORS & Accessories</span>
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('fashion-lifestyle')} className="hover:text-amber-300 transition text-left flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Fashion & Apparel</span>
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('home-kitchen')} className="hover:text-amber-300 transition text-left flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Home & Kitchen Appliances</span>
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('groceries-express')} className="hover:text-amber-300 transition text-left flex items-center">
                  <span className="text-amber-400/60 mr-1.5">›</span>
                  <span>Organic Groceries & Dry Fruits</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Payment & Courier Partners */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider border-l-2 border-amber-400 pl-2.5">
              Payment & Delivery
            </h4>
            
            <div className="text-xs text-gray-300 space-y-2">
              <p>We Accept 100% Cash on Delivery & Direct Mobile Banking:</p>
              
              {/* Payment Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="bg-[#E2136E] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">bKash</span>
                <span className="bg-[#F7941D] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">Nagad</span>
                <span className="bg-[#8C3494] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">Rocket</span>
                <span className="bg-[#1A73E8] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">Visa</span>
                <span className="bg-[#EB001B] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">Mastercard</span>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">Cash On Delivery</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-gray-300">
              <p className="font-bold text-amber-200">Courier Logistics:</p>
              <p className="text-[11px] text-gray-400 mt-1">Steadfast • Pathao Courier • RedX • Paperfly</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <div>
            © {new Date().getFullYear()} <strong className="text-amber-300 font-bold">ASPER GO</strong>. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <span>Crafted for high performance & reliable delivery across Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
