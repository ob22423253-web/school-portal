// User API client. Admin-only CRUD plus the /profile shortcut for the current user.

import api from './axios';

export async function listUsers(params = {}) {
  const { data } = await api.get('/users', { params });
  return data;
}

export async function getUser(id) {
  const { data } = await api.get(`/users/${id}`);
  return data.data;
}

export async function createUser(payload) {
  const { data } = await api.post('/users', payload);
  return data.data;
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/users/profile');
  return data.data;
}
