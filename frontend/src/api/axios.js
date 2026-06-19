// Shared axios instance. Centralises baseURL and the Bearer token interceptor
// so individual api modules just import this and call `.get` / `.post` / etc.

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 15000,
});

// Attach the access token (if any) on every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Map server-side error shape into a thrown Error with a useful message so
// callers can show it directly in an Alert.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const body = err.response?.data;
    let message = 'Network error';
    if (body?.error?.message) message = body.error.message;
    else if (body?.errors?.length) message = body.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    else if (err.message) message = err.message;

    const wrapped = new Error(message);
    wrapped.status = err.response?.status;
    wrapped.body = body;
    return Promise.reject(wrapped);
  }
);

export default api;
