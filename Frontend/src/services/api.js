import axios from 'axios';

const API_URL = 'https://bookflow-backend-drvt.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ THIS IS CRITICAL - Adds token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check if user has requested/borrowed a specific book
export const checkRequestStatus = (bookId) => api.get(`/borrow/check-status/${bookId}`);

// Analytics API (optional - for future dashboard)
export const getAnalyticsData = (timeRange = 'month') => 
  api.get(`/analytics?range=${timeRange}`);

// Wishlist APIs
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (bookId) => api.post('/wishlist', { bookId });
export const removeFromWishlist = (bookId) => api.delete(`/wishlist/${bookId}`);
export const clearWishlist = () => api.delete('/wishlist');

// Forgot password
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// Reset password
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });

// Update profile (name or profile picture)
export const updateProfile = (data) => api.put('/users/profile', data);

// Delete account with password
export const deleteAccount = (password) => api.delete('/users/account', { data: { password } });

// Approve request with custom dates
export const approveRequestWithDates = (requestId, issueDate, dueDate) => 
  api.put(`/borrow/approve/${requestId}`, { issueDate, dueDate });

// Auth APIs
export const register = (name, email, password, role = 'student') =>
  api.post('/auth/register', { name, email, password, role });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// Book APIs
export const getBooks = (category = null) => {
  const url = category && category !== 'All' ? `/books?category=${category}` : '/books';
  return api.get(url);
};
export const addBook = (bookData) => api.post('/books', bookData);
export const deleteBook = (id) => api.delete(`/books/${id}`);

// Borrow APIs
export const requestBorrow = (bookId) => api.post('/borrow/request', { bookId });
export const getMyBorrows = () => api.get('/borrow/my-borrows');
export const getPendingRequests = () => api.get('/borrow/pending');
export const approveRequest = (requestId) => api.put(`/borrow/approve/${requestId}`);
export const getActiveBorrows = () => api.get('/borrow/active');
export const returnBook = (borrowId) => api.put(`/borrow/return/${borrowId}`);

// Notification APIs
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread/count');
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllAsRead = () => api.put('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// Quote APIs
export const getActiveQuote = () => api.get('/quotes/active');
export const getAllQuotes = () => api.get('/quotes/all');
export const addQuote = (quoteData) => api.post('/quotes', quoteData);
export const updateQuote = (id, quoteData) => api.put(`/quotes/${id}`, quoteData);
export const deleteQuote = (id) => api.delete(`/quotes/${id}`);

// User APIs
export const getUsers = () => api.get('/users');

// Category APIs
export const getCategories = () => api.get('/categories');
export const addCategory = (name) => api.post('/categories', { name });
export const deleteCategory = (name) => api.delete(`/categories/${name}`);

export default api;