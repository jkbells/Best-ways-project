/**
 * Axios API Service
 * Centralized HTTP client with auth token injection and error handling
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — inject JWT token ────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — normalize errors ──────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timeout. Check your connection.' : 'Network error. Please try again.');
    return Promise.reject(new Error(message));
  }
);

// ─── Auth Endpoints ────────────────────────────────────────────────────────
export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  setupProfile: (data) => api.put('/auth/setup-profile', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Ambulance Endpoints ───────────────────────────────────────────────────
export const ambulanceAPI = {
  getNearby: (latitude, longitude, type, radius = 10) =>
    api.get('/ambulances/nearby', { params: { latitude, longitude, type, radius } }),
  getTypes: () => api.get('/ambulances/types'),
  getEstimate: (type, distanceKm) =>
    api.get('/ambulances/estimate', { params: { type, distanceKm } }),
};

// ─── Booking Endpoints ─────────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings/create', data),
  emergency: (latitude, longitude) => api.post('/bookings/emergency', { latitude, longitude }),
  getOne: (id) => api.get(`/bookings/${id}`),
  getHistory: (page = 1, limit = 10) => api.get('/bookings/history', { params: { page, limit } }),
  updateStatus: (bookingId, status) => api.post('/bookings/update-status', { bookingId, status }),
  rate: (id, data) => api.post(`/bookings/${id}/rate`, data),
};

// ─── User Endpoints ────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;
