import Axios, { InternalAxiosRequestConfig } from 'axios';
import { getToken } from '@/lib/auth-client';

function requestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}

export const api = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
});

api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);
