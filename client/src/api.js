// Unified API Helper for ASPER GO
const isNativeApp = typeof window !== 'undefined' && (
  window.Capacitor?.isNativePlatform?.() ||
  window.location.protocol === 'capacitor:' ||
  (window.location.protocol === 'http:' && window.location.hostname === 'localhost' && window.location.port === '')
);

export const DEFAULT_PRODUCTION_URL = 'https://aspergo.onrender.com';

export function getBackendBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('aspergo_backend_url');
    if (saved) return saved.replace(/\/$/, '');
    if (isNativeApp) {
      return DEFAULT_PRODUCTION_URL;
    }
  }
  return '';
}

export function formatImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const base = getBackendBaseUrl();
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export function getAuthToken() {
  return localStorage.getItem('aspergo_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('aspergo_token', token);
  } else {
    localStorage.removeItem('aspergo_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const base = getBackendBaseUrl();
  const fullEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const requestUrl = `${base}/api${fullEndpoint}`;

  const response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/me'),
  updateProfile: (userData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(userData) }),
  
  // Admin Users & Roles
  getAdminUsers: () => request('/admin/users'),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  createSubcategory: (data) => request('/subcategories', { method: 'POST', body: JSON.stringify(data) }),
  deleteSubcategory: (id) => request(`/subcategories/${id}`, { method: 'DELETE' }),
  createSubSubcategory: (data) => request('/sub-subcategories', { method: 'POST', body: JSON.stringify(data) }),
  deleteSubSubcategory: (id) => request(`/sub-subcategories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (idOrSlug) => request(`/products/${idOrSlug}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Upload
  uploadImage: (formData) => request('/upload', { method: 'POST', body: formData }),
  uploadMultiple: (formData) => request('/upload-multiple', { method: 'POST', body: formData }),

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  trackOrder: (query) => request(`/orders/track/${encodeURIComponent(query)}`),
  getMyOrders: () => request('/orders/my-orders'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Banners
  getBanners: () => request('/banners'),
  createBanner: (data) => request('/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id, data) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: 'DELETE' }),

  // Stats & Settings
  getAdminStats: () => request('/admin/stats'),
  getSettings: () => request('/settings'),
  updateSettings: (settings) => request('/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),

  // Landing Pages
  getLandingPages: () => request('/landing-pages'),
  getLandingPage: (slugOrId) => request(`/landing-pages/${slugOrId}`),
  createLandingPage: (data) => request('/landing-pages', { method: 'POST', body: JSON.stringify(data) }),
  updateLandingPage: (id, data) => request(`/landing-pages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLandingPage: (id) => request(`/landing-pages/${id}`, { method: 'DELETE' }),
  recordLandingPageView: (id) => request(`/landing-pages/${id}/view`, { method: 'POST' }),

  // Delivery Zones
  getDeliveryZones: (all = false) => request(`/delivery-zones${all ? '?all=1' : ''}`),
  createDeliveryZone: (data) => request('/delivery-zones', { method: 'POST', body: JSON.stringify(data) }),
  updateDeliveryZone: (id, data) => request(`/delivery-zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleDeliveryZone: (id) => request(`/delivery-zones/${id}/toggle`, { method: 'PATCH' }),
  deleteDeliveryZone: (id) => request(`/delivery-zones/${id}`, { method: 'DELETE' }),

  // AI Agent (Marketing, Research, Ad Creator, Customer Support)
  runAIAgent: (data) => request('/ai/agent', { method: 'POST', body: JSON.stringify(data) }),
};
