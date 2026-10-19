import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingBag, User, Phone, Truck, Flame, 
  Menu, X, ChevronDown, LogOut, ShieldCheck, Heart, 
  Sparkles, Layers, ArrowRight, ChevronRight, Tag, Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { getCategoryEmoji, getSubcategoryEmoji } from '../utils/categoryEmojis';

export default function Header({ 
  currentView, 
  setCurrentView, 
  selectedCategory, 
  setSelectedCategory,
  onProductClick,
  onAppInstallClick,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
  onSearch
}) {
  const { user, logout, isSuperAdmin, isManager, isAdminOrManager, setAuthModalOpen, setAuthModalTab, switchDemoRole } = useAuth();
  const { cartCount, cartSubtotal, setCartDrawerOpen } = useCart();

  const [categories, setCategories] = useState([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = propSetSearchQuery || setLocalSearchQuery;

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };
  
  // Hover-driven 3-Tier Cascading Mega Menu States
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const menuCloseTimeoutRef = useRef(null);

  // Auto-scroll animation frame refs for columns and quick category bar
  const mainCatColRef = useRef(null);
  const subCatColRef = useRef(null);
  const childCatColRef = useRef(null);
  const quickCategoriesRef = useRef(null);
  const scrollAnimRef = useRef(null);

  // Smooth Hover Auto-Scroll Handler
  const handleHoverAutoScroll = (e, targetRef, direction = 'vertical') => {
    const container = targetRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let ratio = 0;

    if (direction === 'vertical') {
      const mouseY = e.clientY - rect.top;
      const height = rect.height;
      const edgeThreshold = 90; // Top/bottom trigger zone in px

      if (mouseY < edgeThreshold) {
        // Near top -> scroll up
        ratio = -((edgeThreshold - mouseY) / edgeThreshold);
      } else if (mouseY > height - edgeThreshold) {
        // Near bottom -> scroll down
        ratio = (mouseY - (height - edgeThreshold)) / edgeThreshold;
      }
    } else {
      // Horizontal scrolling
      const mouseX = e.clientX - rect.left;
      const width = rect.width;
      const edgeThreshold = 80;

      if (mouseX < edgeThreshold) {
        ratio = -((edgeThreshold - mouseX) / edgeThreshold);
      } else if (mouseX > width - edgeThreshold) {
        ratio = (mouseX - (width - edgeThreshold)) / edgeThreshold;
      }
    }

    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }

    if (ratio !== 0) {
      const maxSpeed = 12; // Smooth max px per frame
      const step = () => {
        if (!targetRef.current) return;
        if (direction === 'vertical') {
          targetRef.current.scrollTop += ratio * maxSpeed;
        } else {
          targetRef.current.scrollLeft += ratio * maxSpeed;
        }
        scrollAnimRef.current = requestAnimationFrame(step);
      };
      scrollAnimRef.current = requestAnimationFrame(step);
    }
  };

  const stopAutoScroll = () => {
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }
  };

  useEffect(() => {
    api.getCategories()
      .then(res => {
        const cats = res.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          setHoveredCategory(cats[0]);
          if (cats[0].subcategories && cats[0].subcategories.length > 0) {
            setHoveredSubcategory(cats[0].subcategories[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Set default active category and subcategory when categories update
  useEffect(() => {
    if (categories.length > 0) {
      if (!hoveredCategory) {
        setHoveredCategory(categories[0]);
        if (categories[0].subcategories && categories[0].subcategories.length > 0) {
          setHoveredSubcategory(categories[0].subcategories[0]);
        }
      }
    }
  }, [categories]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getProducts({ search: searchQuery, limit: 6 });
        setSearchResults(res.products || []);
        setSearchOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mega Menu Hover Handlers (instant open, slight delay on leave to prevent accidental flickering)
  const handleMenuMouseEnter = () => {
    if (menuCloseTimeoutRef.current) {
      clearTimeout(menuCloseTimeoutRef.current);
    }
    setCategoryMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    menuCloseTimeoutRef.current = setTimeout(() => {
      setCategoryMenuOpen(false);
    }, 150);
  };

  const handleCategoryHover = (cat) => {
    setHoveredCategory(cat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      setHoveredSubcategory(cat.subcategories[0]);
    } else {
      setHoveredSubcategory(null);
    }
  };

  const handleSelectFilter = (slug) => {
    setSelectedCategory(slug);
    setCurrentView('shop');
    setCategoryMenuOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      {/* Top Announcement & Helpline Bar with Luxury Crimson & Gold Palette */}
      <div className="bg-gradient-to-r from-[#8B0000] via-[#B30D26] to-[#7A000E] text-white text-xs py-2 px-4 border-b border-amber-400/40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left: Helpline & Slogan */}
          <div className="flex items-center space-x-4">
            <a href="tel:+8801700000000" className="flex items-center hover:text-amber-200 font-medium transition">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              <span>Helpline: <strong className="text-amber-300 font-bold">+880 1700-000000</strong></span>
            </a>
            <span className="hidden md:inline-block text-white/30">|</span>
            <span className="hidden md:inline-flex items-center bg-amber-400/20 text-amber-200 font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30 text-[11px]">
              <Truck className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              ⚡ Fast 24-48h Delivery Across Bangladesh (Cash on Delivery)
            </span>
          </div>

          {/* Right: Order Tracking & Demo Switcher */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setCurrentView('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-white hover:text-amber-300 flex items-center font-semibold transition cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 mr-1 text-amber-300" />
              <span>Track Order</span>
            </button>

            <span className="text-white/30">|</span>

            {/* Quick Demo Role Switcher for Testing */}
            <div className="hidden lg:flex items-center space-x-1 bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[11px] border border-white/10">
              <span className="text-amber-200 text-[10px] uppercase font-bold">Demo:</span>
              <button 
                onClick={() => switchDemoRole('super_admin')}
                className={`px-2 py-0.5 rounded transition font-bold ${isSuperAdmin ? 'bg-amber-400 text-black shadow-xs' : 'hover:text-amber-200 text-white/80'}`}
              >
                Admin
              </button>
              <button 
                onClick={() => switchDemoRole('manager')}
                className={`px-2 py-0.5 rounded transition font-bold ${isManager ? 'bg-amber-400 text-black shadow-xs' : 'hover:text-amber-200 text-white/80'}`}
              >
                Manager
              </button>
              <button 
                onClick={() => switchDemoRole('customer')}
                className={`px-2 py-0.5 rounded transition font-bold ${user?.role === 'customer' ? 'bg-white text-[#C8102E] shadow-xs' : 'hover:text-amber-200 text-white/80'}`}
              >
                Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Logo */}
          <div 
            onClick={() => {
              setCurrentView('shop');
              setSelectedCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center cursor-pointer group flex-shrink-0"
          >
            <img 
              src="/logo.png" 
              alt="ASPER GO Logo" 
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/public/logo.png';
              }}
            />
          </div>

          {/* Dynamic Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex items-center border-2 border-[#C8102E] rounded-full overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-red-300">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                placeholder="পণ্যের নাম, ক্যাটাগরি (ASPER MOTORS, Gadgets, Fashion) দিয়ে খুঁজুন..."
                className="w-full py-2.5 px-5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button 
                type="submit" 
                title="Search" 
                className="bg-asper-gradient text-white px-6 py-2.5 hover:opacity-95 flex items-center justify-center transition cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                    <span>পণ্য খোঁজা হচ্ছে...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100 pb-1.5">
                      <span>অনুসন্ধানের ফলাফল ({searchResults.length})</span>
                      <span className="text-[10px] text-red-600 font-bold">পণ্য ক্লিক করে বিস্তারিত দেখুন</span>
                    </div>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          onProductClick(product);
                          setSearchOpen(false);
                        }}
                        className="flex items-center px-4 py-2.5 hover:bg-red-50/70 cursor-pointer transition gap-3 border-b border-gray-50 last:border-0"
                      >
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{product.title}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate">
                            <span className="font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[10px]">
                              {getCategoryEmoji(product.category_name)} {product.category_name}
                            </span>
                            {product.subcategory_name && (
                              <span className="text-gray-400 text-[10px] truncate">
                                › {getSubcategoryEmoji(product.subcategory_name, product.category_name)} {product.subcategory_name}
                              </span>
                            )}
                            {product.sub_subcategory_name && (
                              <span className="text-gray-400 text-[10px] truncate">
                                › {product.sub_subcategory_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-black text-[#C8102E]">
                            ৳{product.discount_price || product.price}
                          </div>
                          {product.discount_price && (
                            <div className="text-xs text-gray-400 line-through">
                              ৳{product.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="p-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full py-2.5 text-center text-xs font-black text-[#C8102E] bg-red-50 hover:bg-red-100 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>"{searchQuery}" সম্পর্কিত সকল পণ্য ক্যাটালগে দেখুন →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500 space-y-1">
                    <p className="font-bold text-gray-700">"{searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি</p>
                    <p className="text-xs text-gray-400">ক্যাটাগরি (ASPER MOTORS, Electronics, Fashion) বা পণ্যের নাম দিয়ে চেষ্টা করুন।</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Actions (Admin/Account + Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Admin or Manager Panel Button */}
            {isAdminOrManager && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                  currentView === 'admin' 
                    ? 'bg-[#1A1A1A] text-white' 
                    : 'bg-red-50 text-[#C8102E] border border-red-200 hover:bg-red-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#C8102E]" />
                <span className="hidden sm:inline">
                  {isSuperAdmin ? 'Admin Panel' : 'Manager Panel'}
                </span>
              </button>
            )}

            {/* User Account / Login */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-asper-gradient text-white flex items-center justify-center font-bold text-xs shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs text-gray-500 leading-tight">Hello,</div>
                      <div className="text-xs font-bold text-gray-800 truncate max-w-[90px]">{user.name.split(' ')[0]}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#C8102E]">
                          {user.role}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentView('account');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C8102E] flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account & Orders</span>
                      </button>

                      {isAdminOrManager && (
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C8102E] flex items-center space-x-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#C8102E]" />
                          <span>Management Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-gray-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:border-[#C8102E] text-gray-700 hover:text-[#C8102E] text-xs sm:text-sm font-semibold transition"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>

            {/* Mobile App Install Button */}
            <button
              onClick={onAppInstallClick}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-300 text-xs font-bold transition shadow-2xs"
              title="ASPER GO মোবাইল অ্যাপ"
            >
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Get App</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative flex items-center space-x-2 bg-asper-gradient text-white px-3 sm:px-4 py-2 rounded-xl shadow-md hover:opacity-95 transition group"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-[#C8102E] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="text-[10px] text-red-100 uppercase tracking-wider">Cart</div>
                <div className="font-extrabold">৳{cartSubtotal}</div>
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-[#C8102E]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য বা ক্যাটাগরি (ASPER MOTORS, Gadgets) খুঁজুন..."
              className="w-full py-2.5 px-3.5 text-xs text-gray-800 focus:outline-none"
            />
            <button type="submit" className="bg-asper-gradient text-white px-4 py-2.5 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="border-t border-gray-200 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* HOVER-BASED DYNAMIC MEGA MENU FOR ALL CATEGORIES */}
          <div 
            className="relative"
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            <button
              className="flex items-center space-x-2.5 bg-gradient-to-r from-[#C8102E] via-[#B30D26] to-[#8B0000] text-white px-5 py-3 text-xs sm:text-sm font-black tracking-wider uppercase hover:opacity-95 transition rounded-t-xl shadow-md border-b-2 border-amber-400 cursor-pointer"
            >
              <Menu className="w-4 h-4 text-amber-300" />
              <span className="font-black">ALL CATEGORIES</span>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-200 transition-transform duration-200 ${categoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 3-Tier Multi-column Cascading Mega Flyout Menu (Exact Vertical Serial Order) */}
            {categoryMenuOpen && (
              <div 
                className="absolute top-full left-0 bg-white shadow-2xl border border-gray-200 rounded-b-2xl z-50 flex overflow-hidden animate-fadeIn"
                style={{ minHeight: '360px' }}
              >
                {/* 1st Column: Main Categories List (Vertical Serial with Hover Auto-Scroll) */}
                <div 
                  ref={mainCatColRef}
                  onMouseMove={(e) => handleHoverAutoScroll(e, mainCatColRef, 'vertical')}
                  onMouseLeave={stopAutoScroll}
                  className="w-64 sm:w-72 bg-white py-2 border-r border-gray-100 max-h-[500px] overflow-y-auto flex-shrink-0"
                >
                  <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                    Main Categories
                  </div>
                  {categories.map((cat) => {
                    const isHovered = (hoveredCategory?.id === cat.id);
                    return (
                      <div
                        key={cat.id}
                        onMouseEnter={() => handleCategoryHover(cat)}
                        onClick={() => handleSelectFilter(cat.slug)}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer transition ${
                          isHovered 
                            ? 'bg-red-50 text-[#C8102E] border-l-4 border-[#C8102E] font-bold' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#C8102E]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <span className="text-base flex-shrink-0 leading-none filter drop-shadow-xs transition-transform group-hover:scale-110">
                            {getCategoryEmoji(cat.name, cat.icon)}
                          </span>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isHovered ? 'text-[#C8102E]' : 'text-gray-300'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 2nd Column: Subcategories List (Vertical Serial with Hover Auto-Scroll) */}
                {hoveredCategory && hoveredCategory.subcategories && hoveredCategory.subcategories.length > 0 ? (
                  <div 
                    ref={subCatColRef}
                    onMouseMove={(e) => handleHoverAutoScroll(e, subCatColRef, 'vertical')}
                    onMouseLeave={stopAutoScroll}
                    className="w-64 sm:w-72 bg-[#FAFBFD] py-2 border-r border-gray-200/80 max-h-[500px] overflow-y-auto flex-shrink-0"
                  >
                    <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-200/80 mb-1 flex items-center justify-between">
                      <span className="truncate max-w-[150px]">{hoveredCategory.name}</span>
                      <span className="text-[10px] text-[#C8102E] font-bold">({hoveredCategory.subcategories.length})</span>
                    </div>
                    {hoveredCategory.subcategories.map((sub) => {
                      const isSubHovered = (hoveredSubcategory?.id === sub.id);
                      return (
                        <div
                          key={sub.id}
                          onMouseEnter={() => setHoveredSubcategory(sub)}
                          onClick={() => handleSelectFilter(sub.slug)}
                          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer transition ${
                            isSubHovered 
                              ? 'bg-white text-[#C8102E] shadow-xs border-l-4 border-amber-500 font-bold' 
                              : 'text-gray-700 hover:bg-white hover:text-[#C8102E]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <span className="text-sm flex-shrink-0 leading-none filter drop-shadow-xs">
                              {getSubcategoryEmoji(sub.name, hoveredCategory?.name, sub.icon)}
                            </span>
                            <span className="truncate">{sub.name}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSubHovered ? 'text-[#C8102E]' : 'text-gray-300'}`} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-64 bg-[#FAFBFD] p-6 flex flex-col items-center justify-center text-center text-gray-400 border-r border-gray-100 flex-shrink-0">
                    <Sparkles className="w-8 h-8 mb-2 text-gray-300" />
                    <p className="text-xs font-semibold">No subcategories in</p>
                    <p className="text-xs font-bold text-gray-700 mt-0.5">{hoveredCategory?.name}</p>
                    <button
                      onClick={() => hoveredCategory && handleSelectFilter(hoveredCategory.slug)}
                      className="mt-3 bg-asper-gradient text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow cursor-pointer"
                    >
                      View All Products
                    </button>
                  </div>
                )}

                {/* 3rd Column: Sub-Subcategories List (Vertical Serial with Hover Auto-Scroll) */}
                {hoveredSubcategory && (
                  <div 
                    ref={childCatColRef}
                    onMouseMove={(e) => handleHoverAutoScroll(e, childCatColRef, 'vertical')}
                    onMouseLeave={stopAutoScroll}
                    className="w-64 sm:w-80 bg-white py-2 max-h-[500px] overflow-y-auto flex-shrink-0"
                  >
                    <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 flex items-center justify-between">
                      <span className="truncate max-w-[170px]">{hoveredSubcategory.name}</span>
                      <span className="text-[10px] text-amber-600 font-bold">
                        {hoveredSubcategory.sub_subcategories?.length || 0} items
                      </span>
                    </div>

                    {hoveredSubcategory.sub_subcategories && hoveredSubcategory.sub_subcategories.length > 0 ? (
                      <div className="space-y-0.5">
                        {hoveredSubcategory.sub_subcategories.map((child) => (
                          <div
                            key={child.id}
                            onClick={() => handleSelectFilter(child.slug)}
                            className="px-4 py-2.5 text-xs font-medium text-gray-700 hover:text-[#C8102E] hover:bg-red-50 flex items-center justify-between cursor-pointer transition border-b border-gray-50 last:border-0"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="text-amber-500 font-black">›</span>
                              <span className="truncate">{child.name}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 hover:text-[#C8102E] flex-shrink-0" />
                          </div>
                        ))}

                        <div className="p-3 pt-3 border-t border-gray-100 mt-2">
                          <button
                            onClick={() => handleSelectFilter(hoveredSubcategory.slug)}
                            className="w-full bg-red-50 hover:bg-red-100 text-[#C8102E] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <span>View All in {hoveredSubcategory.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400 space-y-2">
                        <p className="text-xs">Direct Products under</p>
                        <p className="text-xs font-bold text-gray-800">{hoveredSubcategory.name}</p>
                        <button
                          onClick={() => handleSelectFilter(hoveredSubcategory.slug)}
                          className="mt-2 bg-asper-gradient text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow cursor-pointer inline-flex items-center space-x-1"
                        >
                          <span>Explore Products</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Quick Categories Horizontal Bar - Mega Flash Sale Style with Hover Auto-Scroll */}
          <div 
            ref={quickCategoriesRef}
            onMouseMove={(e) => handleHoverAutoScroll(e, quickCategoriesRef, 'horizontal')}
            onMouseLeave={stopAutoScroll}
            className="hidden lg:flex items-center space-x-2 overflow-x-auto py-2 flex-1 mx-3 no-scrollbar scroll-smooth"
          >
            {/* All Products Pill */}
            <button
              onClick={() => handleSelectFilter(null)}
              className={`flex items-center space-x-1.5 text-xs font-black tracking-wide uppercase px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer shadow-2xs ${
                !selectedCategory && currentView === 'shop' 
                  ? 'bg-gradient-to-r from-red-600 to-[#C8102E] text-white border-2 border-[#C8102E] shadow-sm ring-2 ring-red-400/30' 
                  : 'bg-white hover:bg-red-50/80 text-slate-800 hover:text-[#C8102E] border border-slate-200/90 hover:border-red-300'
              }`}
            >
              <span className="text-sm leading-none filter drop-shadow-xs">🛍️</span>
              <span>All Products</span>
            </button>

            {/* Dynamic Product Categories with Bold Typography & Emojis */}
            {categories.map((cat) => {
              const isSelected = (selectedCategory === cat.slug);
              const emoji = getCategoryEmoji(cat.name, cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectFilter(cat.slug)}
                  className={`flex items-center space-x-1.5 text-xs font-black tracking-wide uppercase px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer shadow-2xs group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-red-600 to-[#C8102E] text-white border-2 border-[#C8102E] shadow-sm ring-2 ring-red-400/30' 
                      : 'bg-white hover:bg-red-50/80 text-slate-800 hover:text-[#C8102E] border border-slate-200/90 hover:border-red-300 hover:scale-102 active:scale-98'
                  }`}
                >
                  <span className="text-sm leading-none filter drop-shadow-xs transition-transform group-hover:scale-110">
                    {emoji}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Flash Deals Tab with Badge */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => handleSelectFilter('flash-deals')}
              className={`flex items-center space-x-1.5 text-xs font-black tracking-wide uppercase px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer shadow-md ${
                selectedCategory === 'flash-deals'
                  ? 'bg-amber-400 text-slate-950 border-2 border-amber-300 ring-2 ring-amber-400/40'
                  : 'text-white bg-gradient-to-r from-[#C8102E] via-red-600 to-amber-500 hover:opacity-95 border border-amber-300/40 animate-soft-pulse shadow-red-500/20'
              }`}
            >
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
              <span>MEGA FLASH SALE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories & Subcategories</div>
          
          <div className="space-y-2">
            <button
              onClick={() => handleSelectFilter(null)}
              className={`w-full text-left text-xs p-3 rounded-2xl font-black flex items-center justify-between border transition ${
                !selectedCategory && currentView === 'shop'
                  ? 'bg-red-50 border-red-300 text-[#C8102E]'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">🛍️</span>
                <span>All Products</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {categories.map(cat => {
              const isSelected = (selectedCategory === cat.slug);
              return (
                <div key={cat.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <button
                    onClick={() => handleSelectFilter(cat.slug)}
                    className={`w-full text-left text-xs p-3 font-black flex items-center justify-between transition ${
                      isSelected ? 'bg-red-50 text-[#C8102E]' : 'bg-gray-50 hover:bg-red-50 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{getCategoryEmoji(cat.name, cat.icon)}</span>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </button>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="bg-white p-2 border-t border-gray-100 space-y-1">
                      {cat.subcategories.map(sub => (
                        <div key={sub.id} className="pl-1">
                          <button
                            onClick={() => handleSelectFilter(sub.slug)}
                            className="text-left text-xs text-gray-700 hover:text-[#C8102E] font-bold py-1.5 px-2 rounded-lg hover:bg-red-50 flex items-center justify-between w-full transition"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-sm leading-none">{getSubcategoryEmoji(sub.name, cat.name, sub.icon)}</span>
                              <span className="truncate">{sub.name}</span>
                            </div>
                            <span className="text-gray-400 text-xs">›</span>
                          </button>
                          {sub.sub_subcategories && sub.sub_subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-6 pt-0.5 pb-1">
                              {sub.sub_subcategories.map(child => (
                                <button
                                  key={child.id}
                                  onClick={() => handleSelectFilter(child.slug)}
                                  className="text-[10px] font-semibold bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-[#C8102E] px-2 py-0.5 rounded-full"
                                >
                                  🔹 {child.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-3 flex flex-col space-y-2">
            <button
              onClick={() => {
                setCurrentView('track');
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm py-2 text-gray-700 font-medium flex items-center"
            >
              <Truck className="w-4 h-4 mr-2 text-[#C8102E]" /> Track Your Order
            </button>

            {isAdminOrManager && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm py-2 text-[#C8102E] font-bold flex items-center"
              >
                <ShieldCheck className="w-4 h-4 mr-2" /> Admin / Manager Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
