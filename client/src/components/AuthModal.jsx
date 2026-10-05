import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    register, 
    switchDemoRole 
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-asper-dark-gradient p-6 text-white text-center relative">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <img 
            src="/logo.png" 
            alt="ASPER GO" 
            className="h-9 mx-auto mb-2 object-contain brightness-0 invert"
          />
          <h2 className="text-lg font-black tracking-wide uppercase">
            {authModalTab === 'login' ? 'Customer & Staff Login' : 'Create New Customer Account'}
          </h2>
          <p className="text-xs text-red-200 mt-0.5">
            ANYTHING, ANYTIME, ANYWHERE
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setError('');
            }}
            className={`py-3 text-center transition ${
              authModalTab === 'login' 
                ? 'bg-white text-[#C8102E] border-b-2 border-[#C8102E]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In (লগইন)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('register');
              setError('');
            }}
            className={`py-3 text-center transition ${
              authModalTab === 'register' 
                ? 'bg-white text-[#C8102E] border-b-2 border-[#C8102E]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Register (নতুন অ্যাকাউন্ট)
          </button>
        </div>

        {/* Quick Demo Accounts Pills */}
        <div className="p-4 bg-red-50/60 border-b border-red-100">
          <div className="text-[11px] font-bold text-gray-600 mb-1.5 text-center">
            ⚡ Quick Demo 1-Click Login:
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => switchDemoRole('super_admin')}
              className="bg-gray-900 hover:bg-black text-white py-1.5 px-2 rounded-lg font-bold truncate transition"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => switchDemoRole('manager')}
              className="bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-2 rounded-lg font-bold truncate transition"
            >
              🛠 Manager
            </button>
            <button
              type="button"
              onClick={() => switchDemoRole('customer')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2 rounded-lg font-bold truncate transition"
            >
              🛍 Customer
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          {authModalTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01712345678"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Delivery Address *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House, Road, Area, Dhaka"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-asper-gradient text-white py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Please wait...' : authModalTab === 'login' ? 'Sign In Now' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
