import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';

      const isPasswordCheckRequest =
        url.includes('/auth/login') ||
        url.includes('/auth/change-phone') ||
        url.includes('/auth/change-password');
      if (!isPasswordCheckRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const requestRegisterOtp = (data) => api.post('/auth/register/request-otp', data);
export const verifyRegisterOtp = (data) => api.post('/auth/register/verify-otp', data);
export const login = (data) => api.post('/auth/login', data);
export const getAuthProfile = () => api.get('/auth/profile');
export const changePhone = (data) => api.put('/auth/change-phone', data);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const uploadProductImages = (formData) =>
  api.post('/products/upload-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
// Brands
export const getBrands = () => api.get('/brands');
export const createBrand = (data) => api.post('/brands', data);
export const updateBrand = (id, data) => api.put(`/brands/${id}`, data);
export const deleteBrand = (id) => api.delete(`/brands/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Inventory
export const getSuppliers = () => api.get('/inventory/suppliers');
export const createSupplier = (data) => api.post('/inventory/suppliers', data);
export const getImportReceipts = () => api.get('/inventory/receipts');
export const createImportReceipt = (data) => api.post('/inventory/receipts', data);
export const getLowStock = (threshold) => api.get('/inventory/low-stock', { params: { threshold } });
export const getStockOverview = () => api.get('/inventory/stock-overview');

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const updateCartItem = (id, data) => api.put(`/cart/${id}`, data);
export const removeFromCart = (id) => api.delete(`/cart/${id}`);
export const clearCart = () => api.delete('/cart/clear');

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getUserOrders = () => api.get('/orders/my');
export const getMyOrderById = (id) => api.get(`/orders/my/${id}`);
export const cancelMyOrder = (id) => api.put(`/orders/my/${id}/cancel`);
export const getAllOrders = () => api.get('/orders/admin/all');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const getDashboardStats = () => api.get('/orders/admin/stats');

// Admin users
export const getAllUsers = () => api.get('/auth/users');
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);
export const toggleUserStatus = (id) => api.put(`/auth/users/${id}/status`);
export const getUserOrderSummary = (userId) => api.get(`/orders/admin/user/${userId}/summary`);

export default api;
export const getRevenueByDay = (date) => api.get(`/orders/admin/revenue-by-day?date=${date}`);
export const getRevenueByMonth = (month, year) => api.get(`/orders/admin/revenue-by-month?month=${month}&year=${year}`);
export const getRevenueByDayRange = (days) => api.get(`/orders/admin/revenue-by-day-range?days=${days}`);
export const getRevenueByMonthRange = (year) => api.get(`/orders/admin/revenue-by-month-range?year=${year}`);
export const getTopProducts = () => api.get('/orders/admin/top-products');
// Vouchers
export const getPublicVouchers = () => api.get('/vouchers/public');
export const validateVoucher = (data) => api.post('/vouchers/validate', data);
export const useVoucher = (data) => api.post('/vouchers/use', data);
export const getAdminVouchers = () => api.get('/vouchers/admin');
export const createVoucherAdmin = (data) => api.post('/vouchers/admin', data);
export const updateVoucherAdmin = (id, data) => api.put(`/vouchers/admin/${id}`, data);
export const toggleVoucherAdmin = (id) => api.patch(`/vouchers/admin/${id}/toggle`);
export const deleteVoucherAdmin = (id) => api.delete(`/vouchers/admin/${id}`);