import Axios, { InternalAxiosRequestConfig } from 'axios';

function requestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }
  return config;
}

export const api = Axios.create({
  baseURL: 'https://hacker-news.firebaseio.com/v0',
});

api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// watered down version of https://github.com/alan2207/bulletproof-react/blob/master/apps/react-vite/src/lib/api-client.ts
