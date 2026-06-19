// Auth API client. Thin wrappers around the /api/auth/* endpoints.

import api from './axios';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function refresh(refreshToken) {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data.user;
}
