import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Flame, Sparkles, Filter, SlidersHorizontal, 
  ArrowUpDown, Grid, CheckCircle2, Truck, ShieldCheck, Home, 
  User, RefreshCw, Smartphone
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './api';
import { getCategoryEmoji } from './utils/categoryEmojis';

import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import FlashDeals from './components/FlashDeals';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import FastCheckoutModal from './components/FastCheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import OrderTracker from './components/OrderTracker';
import AuthModal from './components/AuthModal';
import MobileAppInstallModal from './components/MobileAppInstallModal';
import AIAssistantChat from './components/AIAssistantChat';
import Footer from './components/Footer';

import AdminDashboard from './pages/AdminDashboard';
import CustomerAccount from './pages/CustomerAccount';
import LandingPageView from './pages/LandingPageView';
import { pixelTracker } from './utils/pixelTracker';

function StoreApp() {
  const { user, isAdminOrManager, setAuthModalOpen } = useAuth();
  const { cartCount, setCartDrawerOpen } = useCart();

  const [currentView, setCurrentView] = useState('shop'); // 'shop' | 'track' | 'admin' | 'account'
  const [trackingQuery, setTrackingQuery] = useState('');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [appInstallModalOpen, setAppInstallModalOpen] = useState(false);

  // Landing Page Route state
  const [landingSlug, setLandingSlug] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#landing/')) {
      return window.location.hash.replace('#landing/', '');
    }
    return null;
  });

  // Initialize Marketing Pixels & listen to hash changes
  useEffect(() => {
    pixelTracker.init();
    pixelTracker.trackPageView(document.title);

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#landing/')) {
        setLandingSlug(hash.replace('#landing/', ''));
      } else {
        setLandingSlug(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial categories
  useEffect(() => {
    api.getCategories()
      .then(res => setCategories(res.categories || []))
      .catch(console.error);
  }, []);

  // Fetch products whenever selectedCategory, sortBy or searchQuery changes
  useEffect(() => {
    if (currentView !== 'shop') return;
    
    setLoadingProducts(true);
    const params = { sort: sortBy, limit: 60 };

    if (searchQuery && searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (selectedCategory === 'flash-deals') {
      params.flash_deal = '1';
    } else if (selectedCategory) {
      params.category = selectedCategory;
    }

    api.getProducts(params)
      .then(res => {
        setProducts(res.products || []);
      })
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, [selectedCategory, sortBy, searchQuery, currentView]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('shop');
    setSelectedCategory(null);
    setTimeout(() => {
      const catalogEl = document.getElementById('main-catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleTrackOrderFromAnywhere = (orderNum) => {
    setTrackingQuery(orderNum);
    setCurrentView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing a standalone landing page
  if (landingSlug) {
    return (
      <>
        <LandingPageView
          slug={landingSlug}
          onOrderSuccess={(orderNum) => {
            window.location.hash = '';
            setLandingSlug(null);
            handleTrackOrderFromAnywhere(orderNum);
          }}
          onBackToStore={() => {
            window.location.hash = '';
            setLandingSlug(null);
          }}
        />
        <AIAssistantChat />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A] antialiased pb-16 md:pb-0">
      
      {/* Global Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onProductClick={(prod) => setSelectedProduct(prod)}
        onAppInstallClick={() => setAppInstallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'shop' && (
          <div>
            {/* Show Hero Slider and Flash Deals on default home catalog (when not searching or filtering) */}
            {!selectedCategory && !searchQuery && (
              <>
                <HeroSlider 
                  onExploreClick={() => {
                    const catalogEl = document.getElementById('main-catalog');
                    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
                
                <FlashDeals
                  products={products}
                  onProductClick={(prod) => setSelectedProduct(prod)}
                />
              </>
            )}

            {/* Product Catalog Section */}
            <div id="main-catalog" className="max-w-7xl mx-auto px-4 py-8">
              
              {/* Filter & Sorting Header with World-Class Luxury Styling */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
                
                {/* Title & Items Counter */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/20 text-[#C8102E] flex items-center justify-center flex-shrink-0 shadow-2xs border border-red-200/40">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                        {searchQuery ? (
                          <>
                            <span className="text-xl">🔍</span>
                            <span>অনুসন্ধান: "{searchQuery}"</span>
                            <button
                              onClick={handleClearSearch}
                              className="text-xs bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-[#C8102E] px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer border border-slate-200"
                            >
                              ✕ ক্লিয়ার
                            </button>
                          </>
                        ) : selectedCategory === 'flash-deals' ? (
                          <>
                            <span>🔥</span>
                            <span>Mega Flash Deal Specials</span>
                          </>
                        ) : selectedCategory ? (
                          (() => {
                            const foundCat = categories.find(c => c.slug === selectedCategory);
                            return (
                              <>
                                <span className="text-xl leading-none filter drop-shadow-xs">
                                  {getCategoryEmoji(foundCat?.name, foundCat?.icon)}
                                </span>
                                <span>{foundCat?.name || 'Selected Category'}</span>
                              </>
                            );
                          })()
                        ) : (
                          <>
                            <span>🛍️</span>
                            <span>Explore Trending Products</span>
                          </>
                        )}
                      </h2>
                      <span className="bg-red-50 text-[#C8102E] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-200/50">
                        {products.length} Products
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {searchQuery 
                        ? 'পণ্যের নাম, ক্যাটাগরি বা সাব-ক্যাটাগরি অনুযায়ী প্রাপ্ত পণ্যের তালিকা' 
                        : '100% Authentic quality assured items with 24-48h fast nationwide delivery'}
                    </p>
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#C8102E]" />
                    <span>Sort By:</span>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="popular">Most Popular (জনপ্রিয়)</option>
                    <option value="price_asc">Price: Low to High (কম থেকে বেশি)</option>
                    <option value="price_desc">Price: High to Low (বেশি থেকে কম)</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              {loadingProducts ? (
                <div className="py-20 text-center text-gray-400">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-[#C8102E]" />
                  <p className="text-xs font-bold">Loading ASPER GO Catalog...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto my-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-800">
                    {searchQuery ? `"${searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি` : 'No products found'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {searchQuery ? 'ক্যাটাগরি (ASPER MOTORS, Electronics, Fashion) বা পণ্যের অন্য নাম দিয়ে চেষ্টা করুন' : 'Try selecting another category or clear filter'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="mt-4 bg-asper-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:opacity-95 transition"
                  >
                    সকল পণ্য দেখুন (View All)
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View: Track Order */}
        {currentView === 'track' && (
          <OrderTracker initialQuery={trackingQuery} />
        )}

        {/* View: Customer Account */}
        {currentView === 'account' && (
          <CustomerAccount onTrackOrder={handleTrackOrderFromAnywhere} />
        )}

        {/* View: Admin & Manager Dashboard */}
        {currentView === 'admin' && isAdminOrManager && (
          <AdminDashboard 
            onBackToStore={() => setCurrentView('shop')}
            onOpenLandingPage={(slug) => {
              window.location.hash = `#landing/${slug}`;
              setLandingSlug(slug);
            }}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer />
      
      <FastCheckoutModal />

      <OrderSuccessModal
        onTrackOrder={handleTrackOrderFromAnywhere}
        onContinueShopping={() => setCurrentView('shop')}
      />

      <AuthModal />

      <MobileAppInstallModal
        isOpen={appInstallModalOpen}
        onClose={() => setAppInstallModalOpen(false)}
      />

      {/* Floating Storefront AI Assistant */}
      <AIAssistantChat />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 py-2 px-3 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => {
            setCurrentView('shop');
            setSelectedCategory(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center text-[10px] font-bold ${
            currentView === 'shop' && !selectedCategory ? 'text-[#C8102E]' : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('flash-deals');
            setCurrentView('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center text-[10px] font-bold ${
            selectedCategory === 'flash-deals' ? 'text-[#C8102E]' : 'text-gray-500'
          }`}
        >
          <Flame className="w-5 h-5 mb-0.5" />
          <span>Flash Sale</span>
        </button>

        {/* Mobile App Button */}
        <button
          onClick={() => setAppInstallModalOpen(true)}
          className="flex flex-col items-center text-[10px] font-bold text-amber-600 hover:text-amber-700"
        >
          <div className="relative p-1 bg-amber-100 rounded-lg">
            <Smartphone className="w-4 h-4 text-amber-700" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
          </div>
          <span className="mt-0.5 font-extrabold text-[9px] text-amber-700">App</span>
        </button>

        <button
          onClick={() => setCartDrawerOpen(true)}
          className="relative flex flex-col items-center text-[10px] font-bold text-gray-700"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C8102E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <button
          onClick={() => {
            setCurrentView('track');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center text-[10px] font-bold ${
            currentView === 'track' ? 'text-[#C8102E]' : 'text-gray-500'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span>Track</span>
        </button>

        <button
          onClick={() => {
            if (user) {
              setCurrentView('account');
            } else {
              setAuthModalOpen(true);
            }
          }}
          className={`flex flex-col items-center text-[10px] font-bold ${
            currentView === 'account' ? 'text-[#C8102E]' : 'text-gray-500'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{user ? 'Account' : 'Login'}</span>
        </button>
      </div>

      {/* Global Footer */}
      {currentView !== 'admin' && (
        <Footer
          onCategorySelect={(slug) => {
            setSelectedCategory(slug);
            setCurrentView('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTrackClick={() => {
            setCurrentView('track');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreApp />
      </CartProvider>
    </AuthProvider>
  );
}
