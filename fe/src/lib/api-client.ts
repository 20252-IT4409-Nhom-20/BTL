import Axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Request interceptor: Add auth token and standard headers
 * This runs on EVERY request automatically
 */
function requestInterceptor(config: InternalAxiosRequestConfig) {
  // Add auth token if it exists in localStorage
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Standard headers for all requests
  if (config.headers) {
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}

/**
 * Response interceptor: Handle errors globally
 * This runs on EVERY response (success or error)
 */
function responseInterceptor(error: AxiosError) {
  // Handle specific HTTP status codes globally
  if (error.response?.status === 401) {
    // Token expired or invalid
    console.warn('[API] 401 Unauthorized - redirecting to login');
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  if (error.response?.status === 403) {
    console.error('[API] 403 Forbidden - access denied');
  }

  if (error.response?.status === 500) {
    console.error('[API] 500 Server Error');
  }

  return Promise.reject(error);
}

/**
 * Base API client used by all feature APIs
 * - Configured once here
 * - Interceptors run on every request/response
 * - Auth and error handling centralized
 */
export const api = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(
  (response) => response.data,
  responseInterceptor
);

// Reference: https://github.com/alan2207/bulletproof-react/blob/master/apps/react-vite/src/lib/api-client.ts
