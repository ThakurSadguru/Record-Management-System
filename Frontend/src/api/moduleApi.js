// moduleApi.js — module operations ONLY
import api from './axiosInstance'
export const moduleApi = {
  getAll: () =>
    api.get('/modules').then(r => r.data),

  getById: (id) =>
    api.get(`/modules/${id}`).then(r => r.data),

  create: (data) =>
    api.post('/modules', data).then(r => r.data),

  update: (id, data) =>
    api.put(`/modules/${id}`, data).then(r => r.data),

  delete: (id) =>
    api.delete(`/modules/${id}`),

  
}