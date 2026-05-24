import Axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getToken, clearAuth } from '@/lib/auth-client';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Public endpoints
 */
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/topstories',
  '/health',
];

/**
 * Request interceptor: Add auth token and standard headers
 * This runs on EVERY request automatically
 */
function requestInterceptor(config: InternalAxiosRequestConfig) {
  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
    config.url?.includes(endpoint)
  );

  if (!isPublic) {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

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
  if (error.response?.status === 401) {
    console.warn('[API] 401 Unauthorized - redirecting to login');
    clearAuth();
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
api.interceptors.response.use((response) => response.data, responseInterceptor);

// Reference: https://github.com/alan2207/bulletproof-react/blob/master/apps/react-vite/src/lib/api-client.ts
