import Axios, { InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';
const AUTH_EVENT = 'auth-change';

export type StoredUser = {
  _id: string;
  username: string;
  email: string;
  role: string;
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const getUser = (): StoredUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};
export const setUser = (user: StoredUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const AUTH_CHANGE_EVENT = AUTH_EVENT;

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

export const authApi = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
});

authApi.interceptors.request.use(requestInterceptor);
authApi.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);
