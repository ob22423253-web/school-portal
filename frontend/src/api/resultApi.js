// Result API client.

import api from './axios';

export async function listResults(params = {}) {
  const { data } = await api.get('/results', { params });
  return data;
}

export async function getResult(id) {
  const { data } = await api.get(`/results/${id}`);
  return data.data;
}

export async function createResult(payload) {
  const { data } = await api.post('/results', payload);
  return data.data;
}

export async function updateResult(id, payload) {
  const { data } = await api.put(`/results/${id}`, payload);
  return data.data;
}

export async function deleteResult(id) {
  const { data } = await api.delete(`/results/${id}`);
  return data;
}
