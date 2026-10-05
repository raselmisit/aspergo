import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Package, Layers, ShoppingCart, Users, 
  Settings as SettingsIcon, Plus, Trash2, Edit, CheckCircle, 
  AlertCircle, Upload, Eye, Image, TrendingUp, DollarSign,
  ArrowUpRight, RefreshCw, X, Save, Sparkles, Filter, Search,
  ChevronRight, CornerDownRight, Video, Play, Monitor, Smartphone,
  Star, Film, ArrowRight, Zap, Check, CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { compressImage, formatBytes, inspectVideo } from '../utils/mediaCompressor';

export default function AdminDashboard({ onBackToStore }) {
  const { user, isSuperAdmin, isManager } = useAuth();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'products' | 'categories' | 'orders' | 'banners' | 'users' | 'settings'
  
  // Dashboard Data State
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    category_id: '',
    subcategory_id: '',
    sub_subcategory_id: '',
    cost_price: '',
    price: '',
    discount_price: '',
    stock: 20,
    description: '',
    image: '',
    gallery: [],
    video_url: '',
    is_featured: 0,
    is_flash_deal: 0,
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaNotice, setMediaNotice] = useState('');
  const [isDraggingProductMedia, setIsDraggingProductMedia] = useState(false);

  // Banner Modal & Management State
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerPreviewDevice, setBannerPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge_text: 'EXCLUSIVE DEAL',
    button_text: 'SHOP NOW',
    link: '/products',
    image: '',
    background_gradient: 'linear-gradient(135deg, #1A1A1A 0%, #8B0000 60%, #C8102E 100%)',
    display_order: 1
  });
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerNotice, setBannerNotice] = useState('');
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  // Category Modals State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: 'ShoppingBag', description: '', display_order: 0 });
  
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [subcategoryForm, setSubcategoryForm] = useState({ category_id: '', name: '', description: '' });

  const [subSubcategoryModalOpen, setSubSubcategoryModalOpen] = useState(false);
  const [subSubcategoryForm, setSubSubcategoryForm] = useState({ category_id: '', subcategory_id: '', name: '', description: '' });

  // Order filters
  const [orderFilter, setOrderFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Initial fetch
  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const res = await api.getAdminStats();
        setStats(res);
      } else if (activeTab === 'products') {
        const [prodRes, catRes] = await Promise.all([api.getProducts({ limit: 100 }), api.getCategories()]);
        setProducts(prodRes.products || []);
        setCategories(catRes.categories || []);
      } else if (activeTab === 'categories') {
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);
      } else if (activeTab === 'orders') {
        const ordRes = await api.getAdminOrders({ status: orderFilter, search: orderSearch });
        setOrders(ordRes.orders || []);
      } else if (activeTab === 'banners') {
        const banRes = await api.getBanners();
        setBanners(banRes.banners || []);
      } else if (activeTab === 'users' && isSuperAdmin) {
        const userRes = await api.getAdminUsers();
        setUsersList(userRes.users || []);
      } else if (activeTab === 'settings' && isSuperAdmin) {
        const setRes = await api.getSettings();
        setSettings(setRes.settings || {});
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // ==================== BANNER UPLOAD & DRAG-AND-DROP HANDLERS ====================
  const handleProcessBannerFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('error', 'Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setUploadingBanner(true);
    setBannerNotice('Compressing & optimizing banner image...');

    try {
      // 1. Auto Compress Image client-side
      const compressedResult = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 });
      const reductionText = compressedResult.savedPercent > 0 
        ? ` (Auto-compressed: ${formatBytes(compressedResult.originalSize)} ➔ ${formatBytes(compressedResult.compressedSize)}, -${compressedResult.savedPercent}%)`
        : ` (${formatBytes(compressedResult.compressedSize)})`;

      setBannerNotice(`Uploading optimized banner${reductionText}...`);

      // 2. Upload to server
      const formData = new FormData();
      formData.append('file', compressedResult.file);
      const res = await api.uploadImage(formData);

      setBannerForm(prev => ({ ...prev, image: res.url || res.imageUrl }));
      setBannerNotice(`✨ Banner image ready!${reductionText}`);
      notify('success', 'Banner image uploaded and optimized successfully!');
    } catch (err) {
      console.error('Banner upload error:', err);
      notify('error', 'Banner upload failed: ' + err.message);
      setBannerNotice('');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleProcessBannerFile(file);
  };

  const handleBannerDrop = (e) => {
    e.preventDefault();
    setIsDraggingBanner(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessBannerFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image) {
      notify('error', 'Banner title and image are required.');
      return;
    }
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, bannerForm);
        notify('success', 'Banner updated successfully!');
      } else {
        await api.createBanner(bannerForm);
        notify('success', 'New Promotional Banner added!');
      }
      setBannerModalOpen(false);
      setEditingBanner(null);
      setBannerForm({
        title: '',
        subtitle: '',
        badge_text: 'EXCLUSIVE DEAL',
        button_text: 'SHOP NOW',
        link: '/products',
        image: '',
        background_gradient: 'linear-gradient(135deg, #1A1A1A 0%, #8B0000 60%, #C8102E 100%)',
        display_order: 1
      });
      setBannerNotice('');
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to remove this banner?')) return;
    try {
      await api.deleteBanner(id);
      notify('success', 'Banner removed');
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // ==================== PRODUCT MULTI-IMAGE & VIDEO HANDLERS ====================
  const handleProcessProductFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);
    setUploadingMedia(true);
    setMediaNotice(`Processing ${files.length} file(s)...`);

    try {
      let uploadedImages = [];
      let videoUrlFound = null;
      let totalOrigSize = 0;
      let totalCompSize = 0;

      for (const file of files) {
        totalOrigSize += file.size;

        if (file.type.startsWith('image/')) {
          // Auto Compress Product Image
          const compressed = await compressImage(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.82 });
          totalCompSize += compressed.compressedSize;

          const formData = new FormData();
          formData.append('file', compressed.file);
          const res = await api.uploadImage(formData);
          uploadedImages.push(res.url || res.imageUrl);
        } else if (file.type.startsWith('video/')) {
          // Upload Video File
          setMediaNotice(`Uploading video (${formatBytes(file.size)})...`);
          totalCompSize += file.size;

          const formData = new FormData();
          formData.append('file', file);
          const res = await api.uploadImage(formData);
          videoUrlFound = res.url || res.videoUrl;
        }
      }

      // Update Product Form state
      setProductForm(prev => {
        let currentImage = prev.image;
        let currentGallery = Array.isArray(prev.gallery) ? [...prev.gallery] : [];

        if (uploadedImages.length > 0) {
          if (!currentImage) {
            currentImage = uploadedImages[0];
            currentGallery = [...currentGallery, ...uploadedImages.slice(1)];
          } else {
            currentGallery = [...currentGallery, ...uploadedImages];
          }
        }

        return {
          ...prev,
          image: currentImage,
          gallery: currentGallery,
          video_url: videoUrlFound || prev.video_url
        };
      });

      const savedPercent = totalOrigSize > totalCompSize && totalOrigSize > 0
        ? Math.round(((totalOrigSize - totalCompSize) / totalOrigSize) * 100)
        : 0;

      const notice = `✨ Successfully uploaded ${uploadedImages.length} image(s)${videoUrlFound ? ' + 1 video' : ''}! ${savedPercent > 0 ? `(Auto-reduced size by ${savedPercent}%: ${formatBytes(totalOrigSize)} ➔ ${formatBytes(totalCompSize)})` : ''}`;
      setMediaNotice(notice);
      notify('success', 'Media uploaded and optimized successfully!');
    } catch (err) {
      console.error('Product media upload error:', err);
      notify('error', 'Media upload failed: ' + err.message);
      setMediaNotice('');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleProductMediaSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessProductFiles(e.target.files);
    }
  };

  const handleProductMediaDrop = (e) => {
    e.preventDefault();
    setIsDraggingProductMedia(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessProductFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimaryImage = (imageUrl, galleryIdx) => {
    setProductForm(prev => {
      const oldPrimary = prev.image;
      const newGallery = prev.gallery.filter((_, idx) => idx !== galleryIdx);
      if (oldPrimary && oldPrimary !== imageUrl) {
        newGallery.unshift(oldPrimary);
      }
      return {
        ...prev,
        image: imageUrl,
        gallery: newGallery
      };
    });
    notify('success', 'Primary cover photo updated!');
  };

  const handleRemoveGalleryImage = (idxToRemove) => {
    setProductForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleRemovePrimaryImage = () => {
    setProductForm(prev => {
      if (prev.gallery && prev.gallery.length > 0) {
        const nextPrimary = prev.gallery[0];
        const nextGallery = prev.gallery.slice(1);
        return { ...prev, image: nextPrimary, gallery: nextGallery };
      }
      return { ...prev, image: '' };
    });
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.image) {
      notify('error', 'দয়া করে কমপক্ষে ১টি প্রোডাক্ট ছবি যুক্ত করুন (Please add at least 1 product image)');
      return;
    }
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
        notify('success', 'Product updated successfully!');
      } else {
        await api.createProduct(productForm);
        notify('success', 'Product created successfully!');
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      setMediaNotice('');
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      notify('success', 'Product deleted');
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Create Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory(categoryForm);
      notify('success', 'New Category added!');
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', icon: 'ShoppingBag', description: '', display_order: 0 });
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category and all its subcategories?')) return;
    try {
      await api.deleteCategory(id);
      notify('success', 'Category deleted');
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Create Subcategory
  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    try {
      await api.createSubcategory(subcategoryForm);
      notify('success', 'Subcategory created!');
      setSubcategoryModalOpen(false);
      setSubcategoryForm({ category_id: '', name: '', description: '' });
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm('Delete this subcategory?')) return;
    try {
      await api.deleteSubcategory(id);
      notify('success', 'Subcategory deleted');
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Create Sub-Subcategory (Child Category)
  const handleSaveSubSubcategory = async (e) => {
    e.preventDefault();
    if (!subSubcategoryForm.subcategory_id) {
      notify('error', 'দয়া করে প্যারেন্ট সাব-ক্যাটাগরি সিলেক্ট করুন (Please select parent subcategory)');
      return;
    }
    if (!subSubcategoryForm.name || !subSubcategoryForm.name.trim()) {
      notify('error', 'সাব-সাব ক্যাটাগরির নাম লিখুন (Sub-subcategory name is required)');
      return;
    }
    try {
      await api.createSubSubcategory({
        subcategory_id: Number(subSubcategoryForm.subcategory_id),
        name: subSubcategoryForm.name.trim(),
        description: subSubcategoryForm.description ? subSubcategoryForm.description.trim() : ''
      });
      notify('success', 'সাব-সাব ক্যাটাগরি সফলভাবে যুক্ত হয়েছে! (Sub-Subcategory created successfully)');
      setSubSubcategoryModalOpen(false);
      setSubSubcategoryForm({ category_id: '', subcategory_id: '', name: '', description: '' });
      await loadAllData();
    } catch (err) {
      notify('error', err.message || 'Failed to save sub-subcategory');
    }
  };

  // Delete Sub-Subcategory
  const handleDeleteSubSubcategory = async (id) => {
    if (!window.confirm('Delete this sub-subcategory?')) return;
    try {
      await api.deleteSubSubcategory(id);
      notify('success', 'Sub-Subcategory deleted');
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      notify('success', `Order status updated to ${newStatus}`);
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Update User Role (Super Admin only)
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      notify('success', `User role updated to ${newRole}`);
      loadAllData();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      notify('success', 'Site settings updated successfully!');
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Selected Category's Subcategories for product form
  const selectedCategoryObj = categories.find(c => String(c.id) === String(productForm.category_id));
  const selectedSubcategoryObj = selectedCategoryObj?.subcategories?.find(s => String(s.id) === String(productForm.subcategory_id));

  // Selected Category in Sub-Subcategory Modal Form
  const modalSelectedCategoryObj = categories.find(c => String(c.id) === String(subSubcategoryForm.category_id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header with Luxury Crimson & Gold Palette */}
      <div className="bg-gradient-to-r from-[#8B0000] via-[#B30D26] to-[#70000D] text-white py-4 px-6 shadow-xl border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black tracking-wide">
                  ASPER GO Management Panel
                </h1>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow-xs tracking-wider">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Logged in as <strong>{user?.name}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <button
            onClick={onBackToStore}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/25 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>Back to Public Store</span>
            <ArrowUpRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-1">
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                activeTab === 'stats' ? 'bg-gradient-to-r from-[#C8102E] to-[#990011] text-white shadow-md border-l-4 border-amber-400' : 'text-gray-700 hover:bg-red-50 hover:text-[#C8102E]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                activeTab === 'products' ? 'bg-gradient-to-r from-[#C8102E] to-[#990011] text-white shadow-md border-l-4 border-amber-400' : 'text-gray-700 hover:bg-red-50 hover:text-[#C8102E]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                activeTab === 'categories' ? 'bg-gradient-to-r from-[#C8102E] to-[#990011] text-white shadow-md border-l-4 border-amber-400' : 'text-gray-700 hover:bg-red-50 hover:text-[#C8102E]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categories & Subcategories</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                activeTab === 'orders' ? 'bg-gradient-to-r from-[#C8102E] to-[#990011] text-white shadow-md border-l-4 border-amber-400' : 'text-gray-700 hover:bg-red-50 hover:text-[#C8102E]'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders & Fulfillment</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                activeTab === 'banners' ? 'bg-gradient-to-r from-[#C8102E] to-[#990011] text-white shadow-md border-l-4 border-amber-400' : 'text-gray-700 hover:bg-red-50 hover:text-[#C8102E]'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Promotions & Banners</span>
            </button>

            {/* Super Admin Only Tabs */}
            {isSuperAdmin && (
              <>
                <div className="pt-2 border-t border-gray-100 mt-2 text-[10px] font-black text-gray-400 uppercase px-3 flex items-center justify-between">
                  <span>Super Admin Controls</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                </div>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                    activeTab === 'users' ? 'bg-gradient-to-r from-[#C8102E] to-[#990011] text-white shadow-md border-l-4 border-amber-400' : 'text-gray-700 hover:bg-red-50 hover:text-[#C8102E]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Staff Roles & Users</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                    activeTab === 'settings' ? 'bg-gradient-to-r from-[#C8102E] to-[#990011] text-white shadow-md border-l-4 border-amber-400' : 'text-gray-700 hover:bg-red-50 hover:text-[#C8102E]'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Site & Delivery Settings</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Notification banner */}
          {message.text && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* TAB 1: STATS OVERVIEW */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total Revenue</div>
                  <div className="text-xl sm:text-2xl font-black text-[#C8102E] mt-1">৳{stats.stats?.totalRevenue || 0}</div>
                  <div className="text-[10px] text-gray-500 mt-1">Gross sales & orders</div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total Product Cost</div>
                  <div className="text-xl sm:text-2xl font-black text-gray-800 mt-1">৳{stats.stats?.totalCost || 0}</div>
                  <div className="text-[10px] text-gray-500 mt-1">Unit purchase costs</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-4 sm:p-5 rounded-2xl shadow-md col-span-2 sm:col-span-1 border border-emerald-400/40">
                  <div className="text-[11px] text-emerald-100 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Net Profit (লাভ)</span>
                    <span className="bg-white/20 text-white font-black text-[10px] px-1.5 py-0.5 rounded">
                      {stats.stats?.profitMargin || 0}% Margin
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black mt-1">৳{stats.stats?.totalProfit || 0}</div>
                  <div className="text-[10px] text-emerald-100 mt-1 font-semibold">Automatic profit margin</div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total Orders</div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{stats.stats?.totalOrders || 0}</div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-1">{stats.stats?.pendingOrders || 0} pending processing</div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Active Products</div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{stats.stats?.totalProducts || 0}</div>
                  <div className="text-[10px] text-red-500 font-semibold mt-1">{stats.stats?.lowStockProducts || 0} low stock alerts</div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              {stats.lowStockItems && stats.lowStockItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5 text-amber-600" />
                    Low Stock Alerts (Stock &le; 10 units)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stats.lowStockItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                        <div className="flex items-center space-x-2">
                          <img src={item.image} alt={item.title} className="w-8 h-8 rounded object-cover" />
                          <span className="font-bold text-gray-800 truncate max-w-[180px]">{item.title}</span>
                        </div>
                        <span className="font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          {item.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-gray-900">Products Catalog ({products.length})</h2>
                  <p className="text-xs text-gray-500">Manage all items, stock, purchase cost, retail price, and automated profit margins</p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      title: '',
                      category_id: categories[0]?.id || '',
                      subcategory_id: '',
                      sub_subcategory_id: '',
                      cost_price: '',
                      price: '',
                      discount_price: '',
                      stock: 20,
                      description: '',
                      image: '',
                      gallery: [],
                      is_featured: 0,
                      is_flash_deal: 0,
                    });
                    setProductModalOpen(true);
                  }}
                  className="bg-asper-gradient text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow hover:opacity-95 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category Hierarchy</th>
                      <th className="p-3">Unit Cost (কেনা)</th>
                      <th className="p-3">Selling Price (বিক্রি)</th>
                      <th className="p-3">Profit & Margin</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Flash Deal</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => {
                      const sell = Number(p.discount_price || p.price || 0);
                      const cost = Number(p.cost_price || 0);
                      const profit = sell - cost;
                      const margin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : 0;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/70">
                          <td className="p-3 flex items-center space-x-3">
                            <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                            <div className="min-w-0 max-w-xs">
                              <div className="font-bold text-gray-900 truncate">{p.title}</div>
                              <div className="text-[10px] text-gray-400">ID: #{p.id}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-gray-800">{p.category_name || 'N/A'}</div>
                            {p.subcategory_name && (
                              <div className="text-[11px] text-gray-500 flex items-center">
                                <span className="text-gray-400 mr-1">↳</span> {p.subcategory_name}
                              </div>
                            )}
                            {p.sub_subcategory_name && (
                              <div className="text-[10px] text-[#C8102E] font-semibold flex items-center pl-3">
                                <span className="text-gray-400 mr-1">↳</span> {p.sub_subcategory_name}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              ৳{p.cost_price || 0}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-[#C8102E]">৳{p.discount_price || p.price}</div>
                            {p.discount_price && <div className="text-[10px] text-gray-400 line-through">৳{p.price}</div>}
                          </td>
                          <td className="p-3">
                            <div>
                              <div className={`font-black text-xs ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                {profit >= 0 ? `+৳${profit}` : `-৳${Math.abs(profit)}`}
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                                profit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {margin}% margin
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3">
                            {p.is_flash_deal ? (
                              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Active Flash</span>
                            ) : (
                              <span className="text-gray-400 text-[10px]">No</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  title: p.title,
                                  category_id: p.category_id,
                                  subcategory_id: p.subcategory_id || '',
                                  sub_subcategory_id: p.sub_subcategory_id || '',
                                  cost_price: p.cost_price || '',
                                  price: p.price,
                                  discount_price: p.discount_price || '',
                                  stock: p.stock,
                                  description: p.description,
                                  image: p.image,
                                  gallery: p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : [],
                                  is_featured: p.is_featured,
                                  is_flash_deal: p.is_flash_deal,
                                });
                                setProductModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold p-1 cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-red-600 hover:text-red-800 font-bold p-1 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES & 3-LEVEL SUBCATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Dynamic 3-Tier Category Hierarchy</h2>
                    <p className="text-xs text-gray-500">Manage Categories, Subcategories, and Sub-Subcategories (Child Categories) on the fly</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryModalOpen(true)}
                      className="bg-gradient-to-r from-[#C8102E] to-[#990011] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow hover:opacity-95 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Main Category</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (categories.length > 0) {
                          setSubcategoryForm(prev => ({ ...prev, category_id: categories[0].id }));
                        }
                        setSubcategoryModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-[#3D0A11] to-[#25050A] text-amber-200 hover:text-white border border-amber-400/40 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>+ Add Subcategory</span>
                    </button>

                    <button
                      onClick={() => {
                        if (categories.length > 0) {
                          const firstCat = categories[0];
                          setSubSubcategoryForm({
                            category_id: firstCat.id,
                            subcategory_id: firstCat.subcategories?.[0]?.id || '',
                            name: '',
                            description: ''
                          });
                        }
                        setSubSubcategoryModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      <span>+ Add Sub-Subcategory (Child)</span>
                    </button>
                  </div>
                </div>

                {/* Categories & Subcategories List */}
                <div className="space-y-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      
                      {/* Main Category Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-gray-900 uppercase tracking-wide">{cat.name}</span>
                          <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border">
                            slug: {cat.slug}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Category</span>
                        </button>
                      </div>

                      {/* Subcategories & Nested Sub-Subcategories Cards */}
                      <div className="space-y-3 pt-1">
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cat.subcategories.map(sub => (
                              <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs space-y-2">
                                
                                {/* Subcategory Bar */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5 font-bold text-xs text-gray-800">
                                    <span className="text-[#C8102E]">📁</span>
                                    <span>{sub.name}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setSubSubcategoryForm({
                                          category_id: cat.id,
                                          subcategory_id: sub.id,
                                          name: '',
                                          description: ''
                                        });
                                        setSubSubcategoryModalOpen(true);
                                      }}
                                      className="text-[10px] text-[#C8102E] hover:underline font-bold bg-red-50 px-2 py-0.5 rounded"
                                    >
                                      + Add Child
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubcategory(sub.id)}
                                      className="text-gray-400 hover:text-red-600 text-xs p-0.5"
                                      title="Delete Subcategory"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* 3rd Level: Sub-Subcategories Pills */}
                                <div className="pl-4 pt-1 border-t border-gray-100 flex flex-wrap gap-1.5">
                                  {sub.sub_subcategories && sub.sub_subcategories.length > 0 ? (
                                    sub.sub_subcategories.map(child => (
                                      <div key={child.id} className="bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-[11px] flex items-center space-x-1">
                                        <span className="font-medium">{child.name}</span>
                                        <button
                                          onClick={() => handleDeleteSubSubcategory(child.id)}
                                          className="text-gray-400 hover:text-red-600 font-black ml-1"
                                          title="Delete Sub-Subcategory"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-gray-400 italic">No sub-subcategories yet</span>
                                  )}
                                </div>

                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic block py-2">No subcategories created yet under {cat.name}</span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-gray-900">Orders Management</h2>
                  <p className="text-xs text-gray-500">Fulfill orders, change delivery status, and review customer payments</p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={orderFilter}
                    onChange={(e) => {
                      setOrderFilter(e.target.value);
                      api.getAdminOrders({ status: e.target.value, search: orderSearch }).then(res => setOrders(res.orders || []));
                    }}
                    className="text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-gray-900">Order #{order.order_number}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <strong>{order.customer_name}</strong> • Phone: <strong className="text-gray-900">{order.customer_phone}</strong>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-[#C8102E]">৳{order.total_amount}</span>
                        
                        {/* Status Changer */}
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            order.status === 'processing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-gray-200 text-gray-800 border-gray-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-xs bg-white p-3 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400 font-bold">Shipping Address:</span>
                        <p className="text-gray-700">{order.delivery_address} ({order.district})</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold">Payment:</span>
                        <p className="text-gray-700 font-semibold uppercase">{order.payment_method} {order.trx_id ? `(TrxID: ${order.trx_id})` : ''}</p>
                      </div>
                    </div>

                    {/* Order Items Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex items-center justify-between text-gray-700 bg-white/60 px-3 py-1.5 rounded-lg">
                          <span>{item.product_title} × {item.quantity}</span>
                          <span className="font-bold">৳{item.total_price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HERO BANNERS & PROMOTIONS (With Drag & Drop & Live Display Preview) */}
          {activeTab === 'banners' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                  <h2 className="text-base font-black text-gray-900 flex items-center space-x-2">
                    <Image className="w-5 h-5 text-[#C8102E]" />
                    <span>Promotional Slider Banners ({banners.length})</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    একাধিক ব্যানার যুক্ত করুন, ছবি ড্র্যাগ অ্যান্ড ড্রপ করে আপলোড করুন এবং রিয়েল-টাইম প্রিভিউ দেখে পাবলিশ করুন
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBanner(null);
                    setBannerForm({
                      title: '',
                      subtitle: '',
                      badge_text: 'EXCLUSIVE DEAL',
                      button_text: 'SHOP NOW',
                      link: '/products',
                      image: '',
                      background_gradient: 'linear-gradient(135deg, #1A1A1A 0%, #8B0000 60%, #C8102E 100%)',
                      display_order: banners.length + 1
                    });
                    setBannerNotice('');
                    setBannerModalOpen(true);
                  }}
                  className="bg-asper-gradient text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md hover:scale-102 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Banner (নতুন ব্যানার যুক্ত করুন)</span>
                </button>
              </div>

              {/* Banners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b, idx) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 hover:shadow-md transition">
                    <div className="relative rounded-xl overflow-hidden shadow-inner bg-gray-900 aspect-video flex items-center justify-center">
                      <img 
                        src={b.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} 
                        alt={b.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Slide #{b.display_order || idx + 1}
                      </div>
                      {b.badge_text && (
                        <div className="absolute top-2 right-2 bg-[#C8102E] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                          {b.badge_text}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-gray-900 leading-snug">{b.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{b.subtitle}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                      <span className="text-[11px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded border">
                        CTA: {b.button_text || 'Shop Now'} ➔ {b.link || '/products'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingBanner(b);
                            setBannerForm({
                              title: b.title,
                              subtitle: b.subtitle || '',
                              badge_text: b.badge_text || '',
                              button_text: b.button_text || 'SHOP NOW',
                              link: b.link || '/products',
                              image: b.image || '',
                              background_gradient: b.background_gradient || 'linear-gradient(135deg, #1A1A1A 0%, #8B0000 60%, #C8102E 100%)',
                              display_order: b.display_order || idx + 1
                            });
                            setBannerNotice('');
                            setBannerModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold p-1 flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="text-red-600 hover:text-red-800 font-bold p-1 flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STAFF ROLES (Super Admin only) */}
          {activeTab === 'users' && isSuperAdmin && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-black text-gray-900">Staff Roles & User Permissions</h2>
              <p className="text-xs text-gray-500">Super Admin can assign Manager or Super Admin privileges to team members</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email & Phone</th>
                      <th className="p-3">Current Role</th>
                      <th className="p-3 text-right">Assign Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{u.name}</td>
                        <td className="p-3">
                          <div>{u.email}</div>
                          <div className="text-gray-400">{u.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            u.role === 'super_admin' ? 'bg-red-100 text-[#C8102E]' :
                            u.role === 'manager' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs border rounded-lg px-2 py-1 bg-white font-bold"
                          >
                            <option value="customer">Customer</option>
                            <option value="manager">Manager</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS (Super Admin only) */}
          {activeTab === 'settings' && isSuperAdmin && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-black text-gray-900">System & Delivery Rates Settings</h2>
              
              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.site_name || ''}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full border rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full border rounded-xl p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Inside Dhaka Delivery (৳)</label>
                    <input
                      type="number"
                      value={settings.inside_dhaka_delivery || '60'}
                      onChange={(e) => setSettings({ ...settings, inside_dhaka_delivery: e.target.value })}
                      className="w-full border rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Outside Dhaka Delivery (৳)</label>
                    <input
                      type="number"
                      value={settings.outside_dhaka_delivery || '120'}
                      onChange={(e) => setSettings({ ...settings, outside_dhaka_delivery: e.target.value })}
                      className="w-full border rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">bKash Merchant/Personal Number</label>
                    <input
                      type="text"
                      value={settings.bkash_number || ''}
                      onChange={(e) => setSettings({ ...settings, bkash_number: e.target.value })}
                      className="w-full border rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nagad Personal Number</label>
                    <input
                      type="text"
                      value={settings.nagad_number || ''}
                      onChange={(e) => setSettings({ ...settings, nagad_number: e.target.value })}
                      className="w-full border rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-asper-gradient text-white font-bold py-3 px-6 rounded-xl shadow cursor-pointer"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Product Add/Edit Modal with Multiple Images & Video */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 my-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-[#C8102E]" />
                  <span>{editingProduct ? 'Edit Product (প্রোডাক্ট সম্পাদনা করুন)' : 'Add New Product (নতুন প্রোডাক্ট যুক্ত করুন)'}</span>
                </h3>
                <p className="text-xs text-gray-500">একাধিক ছবি, ভিডিও, কেনা দাম ও বিক্রয় মূল্য নির্ধারণ করুন</p>
              </div>
              <button 
                onClick={() => setProductModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-bold mb-1 text-gray-800">Product Title (প্রোডাক্টের নাম) *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. ASPER GO Pro Sound ANC Wireless Earbuds"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none font-semibold text-gray-900"
                />
              </div>

              {/* 3-Level Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <div>
                  <label className="block font-bold mb-1 text-gray-700">1. Main Category *</label>
                  <select
                    required
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value, subcategory_id: '', sub_subcategory_id: '' })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">2. Subcategory</label>
                  <select
                    value={productForm.subcategory_id}
                    onChange={(e) => setProductForm({ ...productForm, subcategory_id: e.target.value, sub_subcategory_id: '' })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">None / General</option>
                    {selectedCategoryObj?.subcategories?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">3. Sub-Subcategory (Child)</label>
                  <select
                    value={productForm.sub_subcategory_id}
                    onChange={(e) => setProductForm({ ...productForm, sub_subcategory_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">None / Optional</option>
                    {selectedSubcategoryObj?.sub_subcategories?.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Unit Cost Configuration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-gray-800">
                    Unit Cost (৳) * <span className="text-[10px] text-gray-500 font-normal">(কেনা দাম/খরচ)</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                    placeholder="e.g. 1200"
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-gray-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-800">
                    Regular Price (৳) * <span className="text-[10px] text-gray-500 font-normal">(রেগুলার মূল্য)</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="e.g. 1800"
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none font-bold text-gray-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-800">
                    Offer Price (৳) <span className="text-[10px] text-gray-500 font-normal">(অফার - অপশনাল)</span>
                  </label>
                  <input
                    type="number"
                    value={productForm.discount_price}
                    onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                    placeholder="e.g. 1550"
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none font-bold text-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-800">
                    Stock Quantity <span className="text-[10px] text-gray-500 font-normal">(মজুদ সংখ্যা)</span>
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-gray-400 focus:outline-none font-bold text-gray-800"
                  />
                </div>
              </div>

              {/* Dynamic Live Profit Margin Preview */}
              {(() => {
                const sellPrice = Number(productForm.discount_price || productForm.price || 0);
                const costPrice = Number(productForm.cost_price || 0);
                const profit = sellPrice - costPrice;
                const margin = sellPrice > 0 ? ((profit / sellPrice) * 100).toFixed(1) : 0;
                if (sellPrice > 0 || costPrice > 0) {
                  return (
                    <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-bold shadow-xs ${
                      profit >= 0 ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' : 'bg-red-50/90 border-red-300 text-red-950'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm">📈</span>
                        <div>
                          <div className="font-extrabold text-[11px] uppercase tracking-wider text-gray-500">Live Profit Calculation</div>
                          <div>
                            Selling: <strong className="text-[#C8102E]">৳{sellPrice}</strong> • Unit Cost: <strong className="text-gray-800">৳{costPrice}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-xs shadow-xs ${
                          profit >= 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {profit >= 0 ? `Estimated Profit: +৳${profit}` : `Loss: -৳${Math.abs(profit)}`}
                        </span>
                        <span className="bg-white px-2 py-1 rounded-lg border border-emerald-300 text-emerald-800 font-black">
                          {margin}% Profit Margin
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* ================= MULTIPLE PRODUCT IMAGES DRAG & DROP & GALLERY ================= */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-xs text-gray-900 uppercase tracking-wide flex items-center space-x-1.5">
                    <Image className="w-4 h-4 text-[#C8102E]" />
                    <span>Product Images Gallery (একাধিক ছবি যুক্ত করুন) *</span>
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {productForm.image ? 1 + (productForm.gallery?.length || 0) : 0} Images added
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingProductMedia(true); }}
                  onDragLeave={() => setIsDraggingProductMedia(false)}
                  onDrop={handleProductMediaDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isDraggingProductMedia
                      ? 'border-[#C8102E] bg-red-50/80 scale-101'
                      : 'border-gray-300 bg-white hover:border-[#C8102E]/60 hover:bg-gray-50/50'
                  }`}
                  onClick={() => document.getElementById('product-media-input')?.click()}
                >
                  <input
                    id="product-media-input"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleProductMediaSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C8102E] flex items-center justify-center shadow-xs">
                      <Upload className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-800">
                        Drag & drop multiple product photos/video here, or <span className="text-[#C8102E] underline">browse files</span>
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        ⚡ বড় সাইজের ছবি হলে ব্রাউজার থেকেই স্বয়ংক্রিয়ভাবে কম্প্রেস ও সাইজ ছোট করে নেওয়া হবে
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Notice / Compression Progress */}
                {mediaNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{mediaNotice}</span>
                  </div>
                )}
                {uploadingMedia && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 flex items-center space-x-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
                    <span>Processing & auto-compressing media files...</span>
                  </div>
                )}

                {/* Primary Cover Image Preview & Gallery Thumbnails */}
                {(productForm.image || (productForm.gallery && productForm.gallery.length > 0)) && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-gray-600 uppercase">Uploaded Image Gallery:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      
                      {/* Primary Cover Image */}
                      {productForm.image && (
                        <div className="relative group rounded-xl overflow-hidden border-2 border-amber-500 shadow-md bg-white aspect-square">
                          <img src={productForm.image} alt="Primary Cover" className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                            ★ PRIMARY COVER
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePrimaryImage}
                            className="absolute top-1.5 right-1.5 bg-red-600/90 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-700"
                            title="Remove Cover Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Gallery Additional Images */}
                      {productForm.gallery && productForm.gallery.map((imgUrl, gIdx) => (
                        <div key={gIdx} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white aspect-square shadow-xs">
                          <img src={imgUrl} alt={`Gallery ${gIdx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-1.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(gIdx)}
                              className="self-end bg-red-600 text-white p-1 rounded hover:bg-red-700"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(imgUrl, gIdx)}
                              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[10px] py-1 px-1.5 rounded text-center shadow"
                            >
                              Set as Cover
                            </button>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                )}

                {/* Direct Image URL input fallback */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Or Paste Main Image URL:</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-xl p-2 bg-white text-xs"
                  />
                </div>
              </div>

              {/* ================= PRODUCT VIDEO SUPPORT SECTION ================= */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-xs text-gray-900 uppercase tracking-wide flex items-center space-x-1.5">
                    <Video className="w-4 h-4 text-[#C8102E]" />
                    <span>Product Video (প্রোডাক্ট ভিডিও - অপশনাল)</span>
                  </label>
                  {productForm.video_url && (
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Video Attached
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Upload Video File (MP4/WebM) or Drag Video above:
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploadingMedia(true);
                          setMediaNotice(`Uploading product video (${formatBytes(file.size)})...`);
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await api.uploadImage(formData);
                            setProductForm(prev => ({ ...prev, video_url: res.url || res.videoUrl }));
                            setMediaNotice(`✨ Video uploaded successfully (${formatBytes(file.size)})!`);
                            notify('success', 'Video attached to product!');
                          } catch (err) {
                            notify('error', 'Video upload failed: ' + err.message);
                          } finally {
                            setUploadingMedia(false);
                          }
                        }
                      }}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-red-50 file:text-[#C8102E] file:font-bold w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Or Video URL (YouTube / Vimeo / MP4 Link):
                    </label>
                    <input
                      type="text"
                      value={productForm.video_url || ''}
                      onChange={(e) => setProductForm({ ...productForm, video_url: e.target.value })}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or /uploads/video.mp4"
                      className="w-full border border-gray-300 rounded-xl p-2 bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Live Video Preview Player */}
                {productForm.video_url && (
                  <div className="mt-3 bg-black rounded-2xl overflow-hidden relative shadow-md p-2">
                    <div className="flex items-center justify-between text-white text-[11px] font-bold px-2 py-1 mb-1">
                      <span className="flex items-center space-x-1.5">
                        <Play className="w-3.5 h-3.5 text-red-500 fill-current" />
                        <span>Live Video Preview Player:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, video_url: '' })}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Remove Video &times;
                      </button>
                    </div>

                    {productForm.video_url.includes('youtube.com') || productForm.video_url.includes('youtu.be') ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={productForm.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          title="Product Video Preview"
                          className="w-full h-48 sm:h-64 rounded-xl"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video
                        src={productForm.video_url}
                        controls
                        className="w-full h-48 sm:h-64 rounded-xl object-contain bg-black"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold mb-1 text-gray-800">Product Description (পণ্যের বিবরণ)</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed specifications, features and warranty info..."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex space-x-6 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="flex items-center space-x-2 font-bold cursor-pointer text-gray-800">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured === 1}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked ? 1 : 0 })}
                    className="rounded text-[#C8102E] focus:ring-red-500 w-4 h-4"
                  />
                  <span>Featured Product (হোমপেজে স্পেশাল ফিচার করুন)</span>
                </label>

                <label className="flex items-center space-x-2 font-bold cursor-pointer text-gray-800">
                  <input
                    type="checkbox"
                    checked={productForm.is_flash_deal === 1}
                    onChange={(e) => setProductForm({ ...productForm, is_flash_deal: e.target.checked ? 1 : 0 })}
                    className="rounded text-[#C8102E] focus:ring-red-500 w-4 h-4"
                  />
                  <span>Include in Flash Deals (মেগা ফ্ল্যাশ ডিল)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-asper-gradient hover-asper-gradient text-white py-3.5 rounded-2xl font-black text-sm shadow-xl hover:shadow-red-900/40 transition cursor-pointer"
              >
                {editingProduct ? 'Update Product (প্রোডাক্ট আপডেট করুন)' : 'Create & Publish Product (প্রোডাক্ট সেভ করুন)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= BANNER ADD / EDIT MODAL WITH DRAG & DROP & LIVE DISPLAY PREVIEW ================= */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900 flex items-center space-x-2">
                  <Image className="w-5 h-5 text-[#C8102E]" />
                  <span>{editingBanner ? 'Edit Promotional Banner' : 'Create Promotional Banner (নতুন ব্যানার যুক্ত করুন)'}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  ছবি ড্র্যাগ অ্যান্ড ড্রপ করে আপলোড করুন এবং রিয়েল-টাইম ডিসপ্লে প্রিভিউ দেখে পছন্দমতো ব্যানার সাজান
                </p>
              </div>
              <button 
                onClick={() => setBannerModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form & Drag-and-Drop Area */}
              <div className="lg:col-span-6 space-y-4">
                <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
                  
                  {/* Banner Image Drag & Drop Area */}
                  <div className="space-y-2">
                    <label className="block font-bold text-gray-800">
                      Banner Image (ব্যানার ছবি - ড্র্যাগ অ্যান্ড ড্রপ করুন) *
                    </label>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingBanner(true); }}
                      onDragLeave={() => setIsDraggingBanner(false)}
                      onDrop={handleBannerDrop}
                      onClick={() => document.getElementById('banner-file-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                        isDraggingBanner
                          ? 'border-[#C8102E] bg-red-50/80 scale-102'
                          : 'border-gray-300 bg-gray-50 hover:border-[#C8102E] hover:bg-red-50/30'
                      }`}
                    >
                      <input
                        id="banner-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageSelect}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#C8102E] flex items-center justify-center shadow-xs">
                          <Upload className="w-6 h-6 animate-pulse" />
                        </div>
                        <span className="font-bold text-xs text-gray-800">
                          Drag & drop banner image here, or <span className="text-[#C8102E] underline">browse file</span>
                        </span>
                        <p className="text-[11px] text-gray-400">
                          ⚡ বড় রেজোলিউশনের ছবি স্বয়ংক্রিয়ভাবে কম্প্রেস ও অপ্টিমাইজ হয়ে যাবে
                        </p>
                      </div>
                    </div>

                    {bannerNotice && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{bannerNotice}</span>
                      </div>
                    )}
                    {uploadingBanner && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 flex items-center space-x-2 animate-pulse">
                        <RefreshCw className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
                        <span>Optimizing and uploading banner image...</span>
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        value={bannerForm.image}
                        onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                        placeholder="Or enter Image URL (e.g. https://...)"
                        className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">Banner Headline (শিরোনাম) *</label>
                      <input
                        type="text"
                        required
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        placeholder="e.g. ANYTHING, ANYTIME, ANYWHERE"
                        className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">Badge Text (অফার ব্যাজ)</label>
                      <input
                        type="text"
                        value={bannerForm.badge_text}
                        onChange={(e) => setBannerForm({ ...bannerForm, badge_text: e.target.value })}
                        placeholder="e.g. EXCLUSIVE FLASH DEALS"
                        className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-[#C8102E]"
                      />
                    </div>
                  </div>

                  {/* Subtitle / Description */}
                  <div>
                    <label className="block font-bold mb-1 text-gray-700">Subtitle / Offer Description</label>
                    <textarea
                      rows={2}
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      placeholder="Biggest Mega Flash Sale with Up to 60% OFF on Top Lifestyle & Gadgets"
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  {/* Button Text, Link, & Order */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">Button CTA</label>
                      <input
                        type="text"
                        value={bannerForm.button_text}
                        onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })}
                        placeholder="SHOP NOW"
                        className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">Link URL</label>
                      <input
                        type="text"
                        value={bannerForm.link}
                        onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                        placeholder="/deals"
                        className="w-full border border-gray-300 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">Display Order</label>
                      <input
                        type="number"
                        value={bannerForm.display_order}
                        onChange={(e) => setBannerForm({ ...bannerForm, display_order: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-asper-gradient text-white py-3.5 rounded-2xl font-black text-sm shadow-xl hover:shadow-red-900/40 transition cursor-pointer"
                  >
                    {editingBanner ? 'Update Banner (ব্যানার আপডেট করুন)' : 'Save & Publish Banner (ব্যানার সেভ করুন)'}
                  </button>
                </form>
              </div>

              {/* Right Column: Real-Time Live Display Preview */}
              <div className="lg:col-span-6 space-y-3 bg-gray-900 p-4 sm:p-5 rounded-3xl text-white flex flex-col justify-between">
                
                <div>
                  {/* Preview Device Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span className="font-black text-xs uppercase tracking-wider text-amber-300">
                        Live Display Preview (সরাসরি ডিসপ্লে প্রিভিউ)
                      </span>
                    </div>

                    <div className="flex bg-black/60 rounded-lg p-0.5 border border-white/10 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setBannerPreviewDevice('desktop')}
                        className={`px-2.5 py-1 rounded-md flex items-center space-x-1 transition ${
                          bannerPreviewDevice === 'desktop' ? 'bg-[#C8102E] text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerPreviewDevice('mobile')}
                        className={`px-2.5 py-1 rounded-md flex items-center space-x-1 transition ${
                          bannerPreviewDevice === 'mobile' ? 'bg-[#C8102E] text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Pixel-Accurate Hero Banner Box Render */}
                  <div className="mt-4">
                    <div className={`relative rounded-2xl overflow-hidden shadow-2xl bg-asper-dark-gradient border border-white/20 transition-all ${
                      bannerPreviewDevice === 'mobile' ? 'max-w-xs mx-auto p-4' : 'w-full p-5 sm:p-6'
                    }`}>
                      
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C8102E_1px,transparent_1px)] [background-size:12px_12px]"></div>

                      <div className={`relative z-10 ${bannerPreviewDevice === 'mobile' ? 'space-y-3 text-center' : 'grid grid-cols-12 gap-4 items-center'}`}>
                        
                        {/* Text info */}
                        <div className={bannerPreviewDevice === 'mobile' ? 'space-y-2' : 'col-span-7 space-y-2.5 text-left'}>
                          
                          {/* Badge */}
                          <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow border border-red-400/40">
                            <Zap className="w-3 h-3 fill-current text-amber-300" />
                            <span>{bannerForm.badge_text || 'EXCLUSIVE DEAL'}</span>
                          </div>

                          {/* Title */}
                          <h4 className={`font-black uppercase tracking-tight text-white leading-tight ${
                            bannerPreviewDevice === 'mobile' ? 'text-base' : 'text-xl sm:text-2xl'
                          }`}>
                            {bannerForm.title || 'BANNER HEADLINE PREVIEW'}
                          </h4>

                          {/* Subtitle */}
                          <p className="text-gray-300 text-[11px] font-medium leading-relaxed line-clamp-2">
                            {bannerForm.subtitle || 'Your promotional offer and discounts will appear right here.'}
                          </p>

                          {/* CTA Button */}
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              type="button"
                              className="bg-asper-gradient text-white px-4 py-2 rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-lg pointer-events-none"
                            >
                              <span>{bannerForm.button_text || 'SHOP NOW'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Image Preview */}
                        <div className={bannerPreviewDevice === 'mobile' ? 'flex justify-center pt-2' : 'col-span-5 flex justify-center'}>
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl blur-md opacity-60"></div>
                            <img
                              src={bannerForm.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
                              alt="Banner Preview"
                              className={`relative rounded-xl shadow-xl object-cover border border-white/30 ${
                                bannerPreviewDevice === 'mobile' ? 'w-48 h-32' : 'w-44 h-32 sm:w-52 sm:h-36'
                              }`}
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 bg-white/5 p-3 rounded-xl border border-white/10 mt-4">
                  💡 <strong>টিপস:</strong> আপনি বামপাশে যা যা পরিবর্তন করবেন, ডানপাশের এই প্রিভিউতে সরাসরি দেখতে পাবেন ছবিটি বড় বা ছোট কেমন ডিসপ্লে হবে।
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 1. Main Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-base text-gray-900">Add New Main Category</h3>
              <button onClick={() => setCategoryModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. ASPER MOTORS"
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <button type="submit" className="w-full bg-[#C8102E] text-white py-3 rounded-xl font-bold">
                Save Main Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Subcategory Modal */}
      {subcategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-base text-gray-900">Add New Subcategory</h3>
              <button onClick={() => setSubcategoryModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveSubcategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Parent Main Category *</label>
                <select
                  required
                  value={subcategoryForm.category_id}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, category_id: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                >
                  <option value="">Select Parent Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  placeholder="e.g. Helmets"
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-[#990011] to-[#C8102E] text-white py-3 rounded-xl font-bold shadow hover:opacity-95 transition cursor-pointer">
                Save Subcategory (সংরক্ষণ করুন)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Sub-Subcategory (Child Category) Modal */}
      {subSubcategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-base text-gray-900">Add New Sub-Subcategory</h3>
                <p className="text-xs text-gray-500">সাব-সাব ক্যাটাগরি (চাইল্ড ক্যাটাগরি) যুক্ত করুন</p>
              </div>
              <button onClick={() => setSubSubcategoryModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveSubSubcategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-gray-700">1. Select Main Category *</label>
                <select
                  required
                  value={subSubcategoryForm.category_id}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const catObj = categories.find(c => String(c.id) === String(catId));
                    setSubSubcategoryForm(prev => ({
                      ...prev,
                      category_id: catId,
                      subcategory_id: catObj?.subcategories?.[0]?.id ? String(catObj.subcategories[0].id) : ''
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select Main Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700">2. Select Parent Subcategory *</label>
                <select
                  required
                  value={subSubcategoryForm.subcategory_id}
                  onChange={(e) => setSubSubcategoryForm(prev => ({ ...prev, subcategory_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Select Subcategory --</option>
                  {modalSelectedCategoryObj?.subcategories?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {modalSelectedCategoryObj && (!modalSelectedCategoryObj.subcategories || modalSelectedCategoryObj.subcategories.length === 0) && (
                  <p className="text-[11px] text-red-500 mt-1.5 font-semibold">
                    ⚠️ এই ক্যাটাগরিতে কোনো সাব-ক্যাটাগরি নেই। আগে সাব-ক্যাটাগরি যুক্ত করুন।
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700">3. Sub-Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={subSubcategoryForm.name}
                  onChange={(e) => setSubSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Full Face Helmets / Vega Bolt / Motul 10W40"
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700">Description (Optional)</label>
                <input
                  type="text"
                  value={subSubcategoryForm.description}
                  onChange={(e) => setSubSubcategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Short note or specs (optional)"
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold shadow transition cursor-pointer"
              >
                Save Sub-Subcategory (সংরক্ষণ করুন)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
