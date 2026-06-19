// Course API client.

import api from './axios';

export async function listCourses(params = {}) {
  const { data } = await api.get('/courses', { params });
  return data;
}

export async function getCourse(id) {
  const { data } = await api.get(`/courses/${id}`);
  return data.data;
}

export async function createCourse(payload) {
  const { data } = await api.post('/courses', payload);
  return data.data;
}

export async function updateCourse(id, payload) {
  const { data } = await api.put(`/courses/${id}`, payload);
  return data.data;
}

export async function deleteCourse(id) {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
}
