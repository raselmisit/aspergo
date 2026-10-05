// Unified API Helper for ASPER GO
const API_BASE = '/api';

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

  const response = await fetch(`${API_BASE}${endpoint}`, {
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
};
