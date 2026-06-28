import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Axios instance pre-configured for the BankFlow API.
 * NOTE: store and authSlice are imported lazily inside the interceptors
 * to avoid circular import issues (api → store → slices → api).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

/**
 * Request interceptor — attach JWT token to every request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bankflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — handle 401 (auto logout) and global error toasts.
 * Lazily imports store to avoid circular dependency at module init time.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;

      // Auto logout on 401 — lazy import avoids circular dependency
      if (status === 401) {
        try {
          const { store } = await import('../redux/store.js');
          const { logoutUser } = await import('../redux/slices/authSlice.js');
          const state = store.getState();
          if (state.auth.token) {
            store.dispatch(logoutUser());
            toast.error('Session expired. Please log in again.');
          }
        } catch (importErr) {
          // If store isn't ready yet, just clear localStorage
          localStorage.removeItem('bankflow_token');
        }
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.');
    } else if (!error.response) {
      toast.error('Unable to reach the server. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
